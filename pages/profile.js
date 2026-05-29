import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import { db } from "../lib/db";
import { users, scanHistory, quizScores, studentActivities } from "../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import withAuth from "../utils/withAuth";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import EcoMascot from "../components/ui/EcoMascot";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useToast } from "../context/ToastContext";
import { signOut } from 'next-auth/react';
import { 
  User, School, Mail, Award, Flame, 
  Camera, Lock, Edit3, LogOut, CheckCircle, X, Upload 
} from 'lucide-react';

function ProfilePage({ profileData }) {
  const { addToast } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState(profileData.fullName || '');
  const [schoolName, setSchoolName] = useState(profileData.schoolName || '');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(profileData.avatarUrl || null);
  const [saving, setSaving] = useState(false);

  const badgesList = [
    { id: 'scan_1', name: 'Scan Pertama', desc: 'Berhasil memilah sampah pertamamu', unlocked: profileData.totalScans >= 1, icon: Camera, color: 'bg-emerald-100 text-emerald-600 border-emerald-300' },
    { id: 'quiz_master', name: 'Quiz Master', desc: 'Mendapat skor >= 800 dalam Kuis', unlocked: profileData.highestScore >= 800, icon: Award, color: 'bg-amber-100 text-amber-600 border-amber-300' },
    { id: 'active_10', name: '10 Hari Aktif', desc: 'Melakukan aktivitas belajar selama 10 hari', unlocked: profileData.activeDaysCount >= 10, icon: Flame, color: 'bg-rose-100 text-rose-600 border-rose-300' },
    { id: 'eco_hero', name: 'Eco Hero', desc: 'Scan >= 10 sampah & skor kuis >= 900', unlocked: profileData.totalScans >= 10 && profileData.highestScore >= 900, icon: Award, color: 'bg-indigo-100 text-indigo-600 border-indigo-300' },
    { id: 'recycle_pro', name: 'Daur Ulang Pro', desc: 'Berhasil scan >= 5 sampah anorganik', unlocked: profileData.inorganicScans >= 5, icon: Award, color: 'bg-teal-100 text-teal-600 border-teal-300' },
  ];

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast({ message: 'Nama lengkap tidak boleh kosong', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = profileData.avatarUrl;

      // 1. Upload Avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          finalAvatarUrl = uploadData.url;
        } else {
          throw new Error('Gagal upload foto profil');
        }
      }

      // 2. Save profile updates (we can send a simple custom PUT route or save directly.
      // Since Drizzle users update is straightforward, let's create a quick API handler for updating profile.
      // Wait, let's write user profile update directly in a fetch update! Let's check if we should create a profile api handler first, or use pages/api/auth/profile.js.
      // Let's create an API endpoint pages/api/auth/profile.js right after this, or update via a custom handler.
      const updateRes = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          schoolName,
          avatarUrl: finalAvatarUrl
        })
      });

      if (updateRes.ok) {
        addToast({ message: 'Profil berhasil diperbarui!', type: 'success' });
        setIsModalOpen(false);
        // Refresh page
        window.location.reload();
      } else {
        throw new Error('Gagal menyimpan profil');
      }

    } catch (err) {
      console.error(err);
      addToast({ message: err.message || 'Gagal memperbarui profil', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>Profil Saya | Smart EcoKids</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-8 select-none">
        
        {/* Profile Card Header */}
        <Card className="p-6 sm:p-8 bg-white border-3 border-primary-bg flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-primary-bg/20 border-2 border-primary-bg text-primary-dark hover:bg-primary-bg transition-colors cursor-pointer"
          >
            <Edit3 className="w-5 h-5" />
          </button>

          {/* Glowing Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-linear-to-tr from-primary to-primary-hover border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-white text-3xl font-nunito font-black flex-shrink-0 select-none">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={fullName}
                fill
                sizes="112px"
                unoptimized={previewUrl.startsWith('data:')}
                className="object-cover"
              />
            ) : (
              fullName.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-3.5 text-center sm:text-left flex-1">
            <div>
              <h2 className="text-3xl font-nunito font-extrabold text-primary-dark">{fullName}</h2>
              <span className="text-xs font-nunito font-bold text-primary uppercase tracking-widest bg-primary-bg/20 border border-primary-bg px-3 py-1 rounded-full inline-block mt-1">
                {profileData.role}
              </span>
            </div>

            <div className="space-y-1.5 text-sm font-sans font-medium text-gray-500 max-w-sm mx-auto sm:mx-0">
              {profileData.schoolName && (
                <p className="flex items-center justify-center sm:justify-start gap-2">
                  <School className="w-4.5 h-4.5 text-primary" />
                  {profileData.schoolName}
                </p>
              )}
              <p className="flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4.5 h-4.5 text-primary" />
                {profileData.email}
              </p>
            </div>
          </div>
        </Card>

        {/* 2. Badges collection Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-nunito font-bold flex items-center gap-2">
            <Award className="w-5.5 h-5.5 text-amber-500" />
            Koleksi Lencana Petualang
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {badgesList.map((badge) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={badge.id}
                  className={`border-3 rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3 transition-all duration-300 relative
                    ${badge.unlocked 
                      ? `${badge.color} shadow-[0_4px_0_0_var(--color-primary-hover)] scale-100` 
                      : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-gray-100 shadow-sm relative">
                    <Icon className="w-6 h-6" />
                    {!badge.unlocked && (
                      <div className="absolute -bottom-1 -right-1 bg-gray-400 text-white rounded-full p-0.5 border border-white">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-nunito font-bold text-sm leading-tight text-primary-dark">
                      {badge.name}
                    </h4>
                    <p className="text-[10px] font-sans font-medium text-gray-500 mt-1 leading-tight">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Recent Activity log */}
        <div className="space-y-4">
          <h3 className="text-xl font-nunito font-bold flex items-center gap-2">
            <Flame className="w-5.5 h-5.5 text-rose-500" />
            Aktivitas Terbarumu
          </h3>
          {profileData.recentActivities.length === 0 ? (
            <Card className="p-8 text-center text-gray-400 font-nunito font-bold bg-white">
              Belum ada catatan aktivitas terbaru.
            </Card>
          ) : (
            <div className="space-y-3">
              {profileData.recentActivities.map((act, index) => {
                let activityTitle = '';
                let activityDesc = '';
                let activityTag = act.activityType;

                if (act.activityType === 'scan') {
                  const meta = JSON.parse(act.metadata || '{}');
                  activityTitle = `Men-scan Sampah: ${meta.wasteName || 'Objek'}`;
                  activityDesc = `Mengklasifikasikan sampah ke kategori ${meta.wasteType === 'organic' ? 'Organik' : 'Anorganik'} dengan kecocokan ${meta.confidence || 0}%`;
                } else if (act.activityType === 'quiz') {
                  const meta = JSON.parse(act.metadata || '{}');
                  activityTitle = `Menyelesaikan Kuis Pahlawan Bumi`;
                  activityDesc = `Memperoleh skor ${meta.score || 0} dengan menjawab ${meta.correctAnswers || 0} dari ${meta.totalQuestions || 0} pertanyaan secara benar`;
                }

                return (
                  <Card key={index} className="p-4 bg-white flex items-center justify-between border-2 border-primary-bg gap-4">
                    <div className="space-y-1">
                      <h4 className="font-nunito font-bold text-sm text-primary-dark">
                        {activityTitle}
                      </h4>
                      <p className="text-xs text-gray-500 font-sans leading-normal">
                        {activityDesc}
                      </p>
                    </div>
                    <span className="text-[10px] font-sans text-gray-400 text-right whitespace-nowrap">
                      {new Date(act.activityDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Logout trigger Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            variant="danger" 
            className="flex items-center gap-2 px-8 py-3.5 text-lg"
          >
            <LogOut className="w-5 h-5" />
            Keluar dari Akun
          </Button>
        </div>

        {/* Edit Profile Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <Card className="w-full max-w-md p-6 bg-white space-y-6 relative border-3 border-primary-bg shadow-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-primary-dark/50 hover:text-primary-dark"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-1 select-none">
                <h3 className="text-xl font-nunito font-extrabold text-primary-dark">
                  Edit Profil Saya
                </h3>
                <p className="text-xs font-nunito font-bold text-primary">
                  Perbarui namamu, sekolah, atau foto profil.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* Upload Avatar image */}
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary-bg bg-gray-50 flex items-center justify-center">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        sizes="64px"
                        unoptimized={previewUrl.startsWith('data:')}
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-xs font-nunito font-extrabold text-primary hover:underline cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Ganti Foto Profil
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                    />
                  </label>
                </div>

                <Input
                  label="Nama Lengkap"
                  id="modal-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <Input
                  label="Nama Sekolah"
                  id="modal-schoolName"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3.5" 
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </Card>
          </div>
        )}

      </div>
    </>
  );
}

export default withAuth(ProfilePage);

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user) {
    return { props: { profileData: null } };
  }

  const userId = session.user.id;

  try {
    // 1. Fetch user data
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    const user = userResult[0];

    // 2. Fetch stats
    const scansCount = await db
      .select({ count: sql`count(*)::int` })
      .from(scanHistory)
      .where(eq(scanHistory.userId, userId));
    const totalScans = scansCount[0]?.count || 0;

    const maxScoreResult = await db
      .select({ maxScore: sql`max(${quizScores.score})::int` })
      .from(quizScores)
      .where(eq(quizScores.userId, userId));
    const highestScore = maxScoreResult[0]?.maxScore || 0;

    const inorganicCountResult = await db
      .select({ count: sql`count(*)::int` })
      .from(scanHistory)
      .where(sql`${scanHistory.userId} = ${userId} AND ${scanHistory.wasteType} = 'inorganic'`);
    const inorganicScans = inorganicCountResult[0]?.count || 0;

    // 3. Fetch unique active days
    const activities = await db
      .select({ date: studentActivities.activityDate })
      .from(studentActivities)
      .where(eq(studentActivities.userId, userId));

    const uniqueDatesSet = new Set(
      activities.map(a => new Date(a.date).toISOString().split('T')[0])
    );
    const activeDaysCount = uniqueDatesSet.size;

    // 4. Fetch recent activities
    const recentAct = await db
      .select()
      .from(studentActivities)
      .where(eq(studentActivities.userId, userId))
      .orderBy(desc(studentActivities.activityDate))
      .limit(5);

    const recentActSerialized = recentAct.map(a => ({
      ...a,
      activityDate: a.activityDate.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));

    return {
      props: {
        profileData: {
          fullName: user.fullName || '',
          email: user.email || '',
          schoolName: user.schoolName || '',
          avatarUrl: user.avatarUrl || null,
          role: user.role || 'siswa',
          totalScans,
          highestScore,
          inorganicScans,
          activeDaysCount,
          recentActivities: recentActSerialized
        }
      }
    };

  } catch (error) {
    console.error("Profile page load error:", error);
    return {
      props: {
        profileData: {
          fullName: session.user.name || '',
          email: session.user.email || '',
          schoolName: '',
          avatarUrl: null,
          role: session.user.role || 'siswa',
          totalScans: 0,
          highestScore: 0,
          inorganicScans: 0,
          activeDaysCount: 0,
          recentActivities: []
        }
      }
    };
  }
}
