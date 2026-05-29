import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { scanHistory, quizScores, studentActivities } from "@/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== 'siswa') {
    return res.status(401).json({ error: 'Tidak terautentikasi atau bukan siswa' });
  }

  const userId = session.user.id;

  try {
    // 1. Total Scans
    const scansCount = await db
      .select({ count: sql`count(*)::int` })
      .from(scanHistory)
      .where(eq(scanHistory.userId, userId));
    const totalScans = scansCount[0]?.count || 0;

    // 2. Highest Quiz Score
    const maxScoreResult = await db
      .select({ maxScore: sql`max(${quizScores.score})::int` })
      .from(quizScores)
      .where(eq(quizScores.userId, userId));
    const highestQuizScore = maxScoreResult[0]?.maxScore || 0;

    // 3. Inorganic Scans Count for Daur Ulang Pro badge
    const inorganicCountResult = await db
      .select({ count: sql`count(*)::int` })
      .from(scanHistory)
      .where(
        sql`${scanHistory.userId} = ${userId} AND ${scanHistory.wasteType} = 'inorganic'`
      );
    const inorganicScans = inorganicCountResult[0]?.count || 0;

    // 4. Fetch all activity dates to compute streak
    const activities = await db
      .select({ date: studentActivities.activityDate })
      .from(studentActivities)
      .where(eq(studentActivities.userId, userId))
      .orderBy(desc(studentActivities.activityDate));

    // Calculate unique active dates (YYYY-MM-DD)
    const uniqueDatesSet = new Set(
      activities.map(a => new Date(a.date).toISOString().split('T')[0])
    );
    const uniqueDates = Array.from(uniqueDatesSet).sort().reverse(); // desc

    let streakDays = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // If active today or yesterday, start calculating streak
    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let currentCheckDate = uniqueDates.includes(todayStr) 
        ? new Date(todayStr) 
        : new Date(yesterdayStr);
      
      while (true) {
        const checkStr = currentCheckDate.toISOString().split('T')[0];
        if (uniqueDatesSet.has(checkStr)) {
          streakDays++;
          // Go to previous day
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 5. Generate 7-day streak history (last 7 days, including today)
    const streakHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      streakHistory.push(uniqueDatesSet.has(dStr));
    }

    // 6. Badges Computation
    const badges = [];
    if (totalScans >= 1) badges.push("Scan Pertama");
    if (highestQuizScore >= 800) badges.push("Quiz Master");
    if (uniqueDatesSet.size >= 10) badges.push("10 Hari Aktif");
    if (totalScans >= 10 && highestQuizScore >= 900) badges.push("Eco Hero");
    if (inorganicScans >= 5) badges.push("Daur Ulang Pro");
    const badgeCount = badges.length;

    // 7. Recent Scans
    const recent = await db
      .select({
        id: scanHistory.id,
        imageUrl: scanHistory.imageUrl,
        wasteName: scanHistory.wasteName,
        wasteType: scanHistory.wasteType,
        confidence: scanHistory.confidence,
        scannedAt: scanHistory.scannedAt,
      })
      .from(scanHistory)
      .where(eq(scanHistory.userId, userId))
      .orderBy(desc(scanHistory.scannedAt))
      .limit(6);

    return res.status(200).json({
      totalScans,
      highestQuizScore,
      badgeCount,
      streakDays,
      streakHistory,
      recentScans: recent,
      badges, // return actual badges list too for profile usage!
    });

  } catch (error) {
    console.error('Student stats API error:', error);
    return res.status(500).json({ error: 'Gagal memuat statistik siswa' });
  }
}
