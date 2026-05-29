import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, quizScores, scanHistory, studentActivities } from "@/drizzle/schema";
import { eq, sql, desc } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== 'guru') {
    return res.status(401).json({ error: 'Tidak terautentikasi atau bukan guru' });
  }

  try {
    // 1. Total Students
    const studentsCountResult = await db
      .select({ count: sql`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'siswa'));
    const totalStudents = studentsCountResult[0]?.count || 0;

    // 2. Average Quiz Score
    const avgQuizResult = await db
      .select({ avgScore: sql`avg(${quizScores.score})::int` })
      .from(quizScores);
    const avgQuizScore = avgQuizResult[0]?.avgScore || 0;

    // 3. Total Scans
    const totalScansResult = await db
      .select({ count: sql`count(*)::int` })
      .from(scanHistory);
    const totalScans = totalScansResult[0]?.count || 0;

    // 4. Active Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeTodayResult = await db
      .select({ count: sql`count(distinct ${studentActivities.userId})::int` })
      .from(studentActivities)
      .where(sql`${studentActivities.activityDate} >= ${todayStart}`);
    const activeToday = activeTodayResult[0]?.count || 0;

    // 5. Score Distribution
    const distributionResult = await db
      .select({
        score: quizScores.score
      })
      .from(quizScores);

    const ranges = [
      { range: "0-199", count: 0 },
      { range: "200-399", count: 0 },
      { range: "400-599", count: 0 },
      { range: "600-799", count: 0 },
      { range: "800-1000", count: 0 }
    ];

    distributionResult.forEach(row => {
      const s = row.score;
      if (s >= 0 && s <= 199) ranges[0].count++;
      else if (s >= 200 && s <= 399) ranges[1].count++;
      else if (s >= 400 && s <= 599) ranges[2].count++;
      else if (s >= 600 && s <= 799) ranges[3].count++;
      else if (s >= 800 && s <= 1000) ranges[4].count++;
    });

    // 6. Activity Chart (30 Days Daily Count)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0,0,0,0);

    const dailyActivities = await db
      .select({
        date: sql`date_trunc('day', ${studentActivities.activityDate})::date`,
        count: sql`count(*)::int`
      })
      .from(studentActivities)
      .where(sql`${studentActivities.activityDate} >= ${thirtyDaysAgo}`)
      .groupBy(sql`date_trunc('day', ${studentActivities.activityDate})::date`)
      .orderBy(sql`date_trunc('day', ${studentActivities.activityDate})::date`);

    // Format activities cleanly
    const activityChart = [];
    const activitiesMap = new Map(dailyActivities.map(a => [
      new Date(a.date).toISOString().split('T')[0], 
      a.count
    ]));

    // Fill missing days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      activityChart.push({
        date: dStr,
        count: activitiesMap.get(dStr) || 0
      });
    }

    return res.status(200).json({
      totalStudents,
      avgQuizScore,
      totalScans,
      activeToday,
      activityChart,
      scoreDistribution: ranges
    });

  } catch (error) {
    console.error('Teacher stats API error:', error);
    return res.status(500).json({ error: 'Gagal memuat statistik guru' });
  }
}
