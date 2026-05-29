import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { scanHistory, quizScores, studentActivities } from "@/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import withAuth from "@/utils/withAuth";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EcoMascot from "@/components/ui/EcoMascot";
import { 
  Camera, Gamepad2, Award, History, 
  BookOpen, Compass, Flame, TrendingUp, Sparkles, Check 
} from 'lucide-react';

function StudentDashboard({ stats }) {
  const quickAccess = [
    { name: 'Mulai Scan AI', desc: 'Foto & Pilah Sampah', path: '/scanner', icon: Camera, color: 'bg-emerald-500 text-white' },
    { name: 'Game Sortir', desc: 'Pilah Sampah Cepat', path: '/game', icon: Gamepad2, color: 'bg-sky-500 text-white' },
    { name: 'Misi Belajar', desc: 'Materi & Kuis Seru', path: '/education', icon: BookOpen, color: 'bg-indigo-500 text-white' },
    { name: 'Panduan DIY', desc: 'Kreativitas Daur Ulang', path: '/guide', icon: Compass, color: 'bg-purple-500 text-white' },
    { name: 'Riwayat Scan', desc: 'Semua Koleksi Sampahmu', path: '/history', icon: History, color: 'bg-teal-500 text-white' },
  ];

  // Challenge progress computation
  const scansToday = stats.recentScans.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    const scanDate = new Date(s.scannedAt).toISOString().split('T')[0];
    return today === scanDate;
  }).length;
  
  const challengeTarget = 3;
  const challengeProgress = Math.min(scansToday, challengeTarget);
  const challengePercent = Math.round((challengeProgress / challengeTarget) * 100);

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const todayIndex = new Date().getDay();

  return (
    <>
      <Head>
        <title>Dashboard Siswa | Smart EcoKids</title>
        <meta name="description" content="Dashboard belajar interaktif Smart EcoKids untuk siswa." />
      </Head>

      <div className="space-y-8 select-none">
        
        {/* 1. Welcome Banner */}
        <div className="relative overflow-hidden bg-linear-to-r from-primary-bg to-primary-hover/45 rounded-3xl p-6 sm:p-8 border-3 border-primary-bg flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="animate-float">
            <EcoMascot size={110} />
          </div>
          <div className="text-center md:text-left space-y-2 flex-1">
            <h2 className="text-3xl font-nunito font-extrabold text-primary-dark leading-tight">
              Hai, {stats.userName}!
            </h2>
            <p className="text-base font-nunito font-bold text-primary-dark/85 leading-relaxed max-w-xl">
              Eco sangat senang melihatmu hari ini. Ayo kita scan 3 sampah dan selesaikan kuis untuk menjaga bumi tetap hijau!
            </p>
          </div>
          
          {/* Daily Challenge Card (Overlay inside Welcome) */}
          <div className="w-full md:max-w-xs bg-white rounded-2xl p-4 border-2 border-primary-bg shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-nunito font-extrabold text-primary-dark uppercase tracking-wider">
                Misi Hari Ini
              </span>
              <span className="text-xs font-sans font-bold text-primary">
                {challengeProgress}/{challengeTarget} Scan
              </span>
            </div>
            <p className="text-xs font-sans font-medium text-primary-dark/80">
              Foto 3 sampah hari ini untuk menjaga streak belajarmu!
            </p>
            {/* Progress Bar */}
            <div className="w-full bg-primary-bg/20 rounded-full h-3.5 border border-primary-bg/50 overflow-hidden">
              <div 
                className="bg-primary-green h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1 text-[8px] font-black text-white"
                style={{ width: `${challengePercent}%` }}
              >
                {challengePercent > 10 && `${challengePercent}%`}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Stats Grid (4 Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-nunito font-black text-primary-dark">{stats.highestQuizScore}</p>
              <p className="text-xs font-nunito font-bold text-primary-dark/60 uppercase">Skor Kuis</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-nunito font-black text-primary-dark">{stats.badgeCount}</p>
              <p className="text-xs font-nunito font-bold text-primary-dark/60 uppercase">Lencana</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4.5">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-2xl font-nunito font-black text-primary-dark">{stats.streakDays} Hari</p>
              <p className="text-xs font-nunito font-bold text-primary-dark/60 uppercase">Streak Aktif</p>
            </div>
          </Card>
        </div>

        {/* 3. Streak & Challenge Progress */}
        <Card className="p-6">
          <h3 className="text-lg font-nunito font-bold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            Aktivitas Mingguan
          </h3>
          <div className="grid grid-cols-7 gap-2 sm:gap-4 text-center">
            {stats.streakHistory.map((active, idx) => {
              const dayOffset = idx - 6;
              const date = new Date();
              date.setDate(date.getDate() + dayOffset);
              const dayName = daysOfWeek[date.getDay()];
              const isToday = date.getDay() === todayIndex;

              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className={`text-xs font-nunito font-bold ${isToday ? 'text-primary' : 'text-primary-dark/60'}`}>
                    {dayName} {isToday && '(Hari ini)'}
                  </span>
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 flex items-center justify-center transition-all duration-300
                    ${active 
                      ? 'bg-primary-bg border-primary-green text-primary-dark shadow-sm' 
                      : 'bg-white border-dashed border-gray-200 text-gray-300'}`}
                  >
                    {active ? <Check className="w-5 h-5 text-primary-green stroke-3" /> : <Flame className="w-4 h-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* 4. Quick Access Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-nunito font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Akses Cepat Petualangan
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {quickAccess.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link key={qa.path} href={qa.path}>
                  <div className="storybook-card flex flex-col items-center justify-center p-5 text-center cursor-pointer select-none bg-white">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${qa.color} mb-3 shadow-sm`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-nunito font-extrabold text-sm text-primary-dark leading-tight block">
                      {qa.name}
                    </span>
                    <span className="text-[10px] font-sans font-medium text-primary-dark/60 mt-1 block leading-tight">
                      {qa.desc}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 5. Recent Scans (Horizontal Scroll) */}
        <div className="space-y-4">
          <h3 className="text-xl font-nunito font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Koleksi Sampah Terbarumu
          </h3>
          {stats.recentScans.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12 text-center bg-white">
              <EcoMascot size={90} className="opacity-50 mb-3" />
              <p className="font-nunito font-bold text-primary-dark/70 text-lg">Kamu belum men-scan sampah</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Ayo foto botol plastik atau sisa makananmu sekarang!</p>
              <Link href="/scanner">
                <span className="bg-primary text-white font-nunito font-bold px-6 py-2.5 rounded-full hover:bg-primary-dark transition-colors cursor-pointer text-sm">
                  Coba Scan Pertama
                </span>
              </Link>
            </Card>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-thin select-none">
              {stats.recentScans.map((scan) => (
                <div key={scan.id} className="shrink-0 w-64 storybook-card bg-white p-4 space-y-3">
                  <div className="w-full h-36 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative">
                    <Image
                      src={scan.imageUrl}
                      alt={scan.wasteName}
                      fill
                      sizes="256px"
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge color={scan.wasteType === 'organic' ? 'organic' : 'inorganic'}>
                        {scan.wasteType === 'organic' ? 'Organik' : 'Anorganik'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-nunito font-bold text-base truncate">{scan.wasteName}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(scan.scannedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        Kecocokan: {scan.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default withAuth(StudentDashboard, { requiredRole: "siswa" });

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user || session.user.role !== 'siswa') {
    return { props: { stats: null } };
  }

  const userId = session.user.id;

  try {
    // 1. Total Scans count
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

    // 3. Inorganic Scans Count
    const inorganicCountResult = await db
      .select({ count: sql`count(*)::int` })
      .from(scanHistory)
      .where(
        sql`${scanHistory.userId} = ${userId} AND ${scanHistory.wasteType} = 'inorganic'`
      );
    const inorganicScans = inorganicCountResult[0]?.count || 0;

    // 4. Unique dates of student activities for streak
    const activities = await db
      .select({ date: studentActivities.activityDate })
      .from(studentActivities)
      .where(eq(studentActivities.userId, userId))
      .orderBy(desc(studentActivities.activityDate));

    const uniqueDatesSet = new Set(
      activities.map(a => new Date(a.date).toISOString().split('T')[0])
    );
    const uniqueDates = Array.from(uniqueDatesSet).sort().reverse(); // desc

    let streakDays = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates.includes(todayStr) || uniqueDates.includes(yesterdayStr)) {
      let currentCheckDate = uniqueDates.includes(todayStr) 
        ? new Date(todayStr) 
        : new Date(yesterdayStr);
      
      while (true) {
        const checkStr = currentCheckDate.toISOString().split('T')[0];
        if (uniqueDatesSet.has(checkStr)) {
          streakDays++;
          currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 5. Generate 7-day streak history
    const streakHistory = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      streakHistory.push(uniqueDatesSet.has(dStr));
    }

    // 6. Badge count
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
      .limit(8);

    // Format serialized dates for client hydration
    const recentScansSerialized = recent.map(r => ({
      ...r,
      scannedAt: r.scannedAt.toISOString(),
    }));

    return {
      props: {
        stats: {
          userName: session.user.name,
          totalScans,
          highestQuizScore,
          badgeCount,
          streakDays,
          streakHistory,
          recentScans: recentScansSerialized,
        }
      }
    };

  } catch (error) {
    console.error("student dashboard SSR error:", error);
    return {
      props: {
        stats: {
          userName: session.user.name,
          totalScans: 0,
          highestQuizScore: 0,
          badgeCount: 0,
          streakDays: 0,
          streakHistory: [false, false, false, false, false, false, false],
          recentScans: [],
        }
      }
    };
  }
}
