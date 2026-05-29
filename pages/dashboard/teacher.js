import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, quizScores, scanHistory, studentActivities } from "@/drizzle/schema";
import { eq, sql, desc, or, like, and } from "drizzle-orm";
import withAuth from "@/utils/withAuth";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { 
  Users, Award, Camera, ShieldAlert, 
  Search, Calendar, ArrowRight, BarChart 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart as RechartBarChart, Bar 
} from 'recharts';

function TeacherDashboard({ stats, initialStudents, totalStudentsCount }) {
  const router = useRouter();
  const [search, setSearch] = useState(router.query.search || '');
  const [students, setStudents] = useState(initialStudents);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    router.push({
      pathname: router.pathname,
      query: { ...router.query, search: search.trim() }
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard Guru | Smart EcoKids</title>
        <meta name="description" content="Dashboard guru untuk memantau perkembangan belajar lingkungan siswa." />
      </Head>

      <div className="space-y-8 select-none">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-nunito font-extrabold text-primary-dark leading-tight">
              Dashboard Guru
            </h2>
            <p className="text-sm font-nunito font-bold text-primary">
              Pantau perkembangan dan kontribusi daur ulang muridmu.
            </p>
          </div>
        </div>

        {/* 1. Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="flex items-center gap-4 p-4.5">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-nunito font-black text-primary-dark">{stats.totalStudents}</p>
              <p className="text-xs font-nunito font-bold text-primary-dark/60 uppercase">Total Siswa</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-nunito font-black text-primary-dark">{stats.avgQuizScore}</p>
              <p className="text-xs font-nunito font-bold text-primary-dark/60 uppercase">Rata-rata Kuis</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-nunito font-black text-primary-dark">{stats.totalScans}</p>
              <p className="text-xs font-nunito font-bold text-primary-dark/60 uppercase">Total Scan</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4.5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-nunito font-black text-primary-dark">{stats.activeToday}</p>
              <p className="text-xs font-nunito font-bold text-primary-dark/60 uppercase">Aktif Hari Ini</p>
            </div>
          </Card>
        </div>

        {/* 2. Charts (Only rendered on client to avoid hydration errors) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart: Activity over 30 Days */}
            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-nunito font-bold flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                Grafik Aktivitas Siswa (30 Hari)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.activityChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-primary-bg)" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(str) => {
                        const parts = str.split('-');
                        return `${parts[2]}/${parts[1]}`;
                      }}
                      stroke="var(--color-primary-dark)"
                      style={{ fontSize: 10, fontWeight: 'bold' }}
                    />
                    <YAxis stroke="var(--color-primary-dark)" style={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: '2px solid var(--color-primary-bg)', fontFamily: 'Nunito', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Bar Chart: Score Distribution */}
            <Card className="p-5 space-y-4">
              <h3 className="text-lg font-nunito font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Distribusi Skor Kuis Siswa
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart data={stats.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-primary-bg)" />
                    <XAxis dataKey="range" stroke="var(--color-primary-dark)" style={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis stroke="var(--color-primary-dark)" style={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: '2px solid var(--color-primary-bg)', fontFamily: 'Nunito', fontWeight: 'bold' }} />
                    <Bar dataKey="count" fill="var(--color-primary-hover)" radius={[8, 8, 0, 0]} />
                  </RechartBarChart>
                </ResponsiveContainer>
              </div>
            </Card>
        </div>

        {/* 3. Students Table & Search */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-nunito font-bold">Daftar Perkembangan Siswa</h3>
            
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:max-w-xs">
              <Input
                placeholder="Cari siswa/sekolah..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="search-input"
              />
              <Button type="submit" variant="primary" className="py-2.5 px-4 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </Button>
            </form>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-bg/30 text-primary-dark font-nunito font-bold text-sm border-b-2 border-primary-bg/50">
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Sekolah</th>
                  <th className="p-4 text-center">Total Scan</th>
                  <th className="p-4 text-center">Skor Tertinggi</th>
                  <th className="p-4 text-right">Terakhir Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans text-sm font-medium text-gray-700 bg-white">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 font-nunito font-bold">
                      Tidak ada siswa ditemukan
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-primary-bg/10 transition-colors">
                      <td className="p-4 font-nunito font-bold text-primary-dark">{student.fullName}</td>
                      <td className="p-4 text-gray-500">{student.email}</td>
                      <td className="p-4">{student.schoolName || '-'}</td>
                      <td className="p-4 text-center font-bold text-primary">{student.totalScans}</td>
                      <td className="p-4 text-center font-bold text-amber-500">{student.highestScore}</td>
                      <td className="p-4 text-right text-xs text-gray-400">
                        {student.lastActive 
                          ? new Date(student.lastActive).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Belum aktif'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

export default withAuth(TeacherDashboard, { requiredRole: "guru" });

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user || session.user.role !== 'guru') {
    return { props: { stats: null, initialStudents: [] } };
  }

  const search = context.query.search || '';
  
  try {
    // 1. Compute stats
    const studentsCountResult = await db
      .select({ count: sql`count(*)::int` })
      .from(users)
      .where(eq(users.role, 'siswa'));
    const totalStudents = studentsCountResult[0]?.count || 0;

    const avgQuizResult = await db
      .select({ avgScore: sql`avg(${quizScores.score})::int` })
      .from(quizScores);
    const avgQuizScore = avgQuizResult[0]?.avgScore || 0;

    const totalScansResult = await db
      .select({ count: sql`count(*)::int` })
      .from(scanHistory);
    const totalScans = totalScansResult[0]?.count || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const activeTodayResult = await db
      .select({ count: sql`count(distinct ${studentActivities.userId})::int` })
      .from(studentActivities)
      .where(sql`${studentActivities.activityDate} >= ${todayStart}`);
    const activeToday = activeTodayResult[0]?.count || 0;

    // 2. Score Distribution
    const distributionResult = await db
      .select({ score: quizScores.score })
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

    // 3. Activity Chart (30 Days Daily Count)
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
      .groupBy(sql`date_trunc('day', ${studentActivities.activityDate})::date`);

    const activitiesMap = new Map(dailyActivities.map(a => [
      new Date(a.date).toISOString().split('T')[0], 
      a.count
    ]));

    const activityChart = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      activityChart.push({
        date: dStr,
        count: activitiesMap.get(dStr) || 0
      });
    }

    // 4. Student query with optional search
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
      .limit(30);

    const initialStudents = await Promise.all(studentsList.map(async (student) => {
      const scansCount = await db
        .select({ count: sql`count(*)::int` })
        .from(scanHistory)
        .where(eq(scanHistory.userId, student.id));
      
      const highestScoreResult = await db
        .select({ maxScore: sql`max(${quizScores.score})::int` })
        .from(quizScores)
        .where(eq(quizScores.userId, student.id));

      return {
        ...student,
        totalScans: scansCount[0]?.count || 0,
        highestScore: highestScoreResult[0]?.maxScore || 0,
        lastActive: student.lastActive ? student.lastActive.toISOString() : null,
      };
    }));

    return {
      props: {
        stats: {
          totalStudents,
          avgQuizScore,
          totalScans,
          activeToday,
          activityChart,
          scoreDistribution: ranges,
        },
        initialStudents,
        totalStudentsCount: totalStudents,
      }
    };

  } catch (error) {
    console.error("Teacher dashboard SSR error:", error);
    return {
      props: {
        stats: {
          totalStudents: 0,
          avgQuizScore: 0,
          totalScans: 0,
          activeToday: 0,
          activityChart: [],
          scoreDistribution: [],
        },
        initialStudents: [],
        totalStudentsCount: 0,
      }
    };
  }
}
