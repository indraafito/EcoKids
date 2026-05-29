import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, scanHistory, quizScores } from "@/drizzle/schema";
import { eq, like, or, sql, and } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || session.user.role !== 'guru') {
    return res.status(401).json({ error: 'Tidak terautentikasi atau bukan guru' });
  }

  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    // 1. Where clause for search
    let searchCondition = eq(users.role, 'siswa');
    if (search.trim()) {
      searchCondition = and(
        eq(users.role, 'siswa'),
        or(
          like(users.fullName, `%${search.trim()}%`),
          like(users.schoolName, `%${search.trim()}%`),
          like(users.email, `%${search.trim()}%`)
        )
      );
    }

    // 2. Count Total Matching Students
    const totalCountResult = await db
      .select({ count: sql`count(*)::int` })
      .from(users)
      .where(searchCondition);
    const total = totalCountResult[0]?.count || 0;

    // 3. Fetch Student Records with Paginated SQL aggregations
    // Using simple mapping: we get the list of users, then fetch counts/scores, or a neat subquery
    const studentsList = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        schoolName: users.schoolName,
        lastActive: users.lastActive,
      })
      .from(users)
      .where(searchCondition)
      .limit(limit)
      .offset(offset);

    // Dynamic stats aggregation per student
    const studentsWithStats = await Promise.all(studentsList.map(async (student) => {
      // Get scan count
      const scansCount = await db
        .select({ count: sql`count(*)::int` })
        .from(scanHistory)
        .where(eq(scanHistory.userId, student.id));
      
      // Get highest quiz score
      const highestScoreResult = await db
        .select({ maxScore: sql`max(${quizScores.score})::int` })
        .from(quizScores)
        .where(eq(quizScores.userId, student.id));

      return {
        ...student,
        totalScans: scansCount[0]?.count || 0,
        highestScore: highestScoreResult[0]?.maxScore || 0,
      };
    }));

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      students: studentsWithStats,
      total,
      page,
      totalPages,
    });

  } catch (error) {
    console.error('Teacher students list API error:', error);
    return res.status(500).json({ error: 'Gagal memuat daftar siswa' });
  }
}
