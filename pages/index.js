import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../lib/auth";
import EcoMascot from '../components/ui/EcoMascot';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  Camera, Gamepad2, Award, History, 
  Compass, BarChart2, Menu, X, ArrowRight, 
  Sparkles, Quote, Mail, MapPin
} from 'lucide-react';

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  if (session && session.user) {
    const destination = session.user.role === 'guru' ? '/dashboard/teacher' : '/dashboard/student';
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      const dashboardPath = session.user.role === 'guru' 
        ? '/dashboard/teacher' 
        : '/dashboard/student';
      router.push(dashboardPath);
    }
  }, [status, session, router]);

  const stats = [
    { value: '500+', label: 'Pelajar Aktif' },
    { value: '10.000+', label: 'Sampah Dideteksi' },
    { value: '98%', label: 'Kepuasan Guru' },
    { value: '50+', label: 'Sekolah Mitra' },
  ];

  const features = [
    { name: 'Scanner AI', desc: 'Foto sampahmu dan temukan jenisnya secara instan!', icon: Camera, color: 'var(--color-primary)' },
    { name: 'Misi Belajar', desc: 'Baca materi seru dan selesaikan kuis untuk jadi pahlawan!', icon: Award, color: 'var(--color-primary-hover)' },
    { name: 'Game Sortir', desc: 'Bantu Eco menyortir sampah ke tempat yang benar sebelum waktu habis!', icon: Gamepad2, color: 'var(--color-primary-dark)' },
    { name: 'Riwayat Scan', desc: 'Simpan semua pencapaian dan jenis sampah yang pernah kamu daur ulang.', icon: History, color: 'var(--color-primary-green)' },
    { name: 'Panduan DIY', desc: 'Pelajari cara membuat kerajinan unik dari barang bekas.', icon: Compass, color: 'var(--color-primary-teal)' },
    { name: 'Dashboard Guru', desc: 'Pantau aktivitas belajar siswa dengan statistik yang rapi.', icon: BarChart2, color: 'var(--color-primary-hover)' },
  ];

  const testimonials = [
    { name: 'Ibu Ratna', role: 'Guru SD Nasional', text: 'EcoKids membantu murid-murid saya belajar memilah sampah dengan sangat menyenangkan. Game dan kuisnya bikin ketagihan!' },
    { name: 'Budi Santoso', role: 'Siswa Kelas 4', text: 'Mascot Eco lucu banget! Sekarang aku suka mengumpulkan botol plastik untuk difoto dengan kamera AI-nya.' },
    { name: 'Pak Handoko', role: 'Kepala Sekolah', text: 'Platform yang sangat inovatif untuk membangun karakter peduli lingkungan sejak usia dini di sekolah kami.' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-primary-dark font-sans">
      
      {/* 1. Dynamic Responsive Header */}
      <nav className="fixed top-6 left-6 right-6 z-50 bg-white/60 backdrop-blur-2xl border border-white/40 px-8 py-4 flex items-center justify-between rounded-[32px] shadow-2xl shadow-gray-200/50 select-none">
        <div className="flex items-center gap-3">
          <EcoMascot size={46} />
          <div>
            <h1 className="text-2xl font-nunito font-extrabold tracking-tight leading-none text-primary-dark mb-1">
              EcoKids
            </h1>
            <span className="text-[10px] font-nunito font-black text-primary uppercase tracking-[0.2em] opacity-70">
              Sahabat Bumi
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10 font-nunito font-extrabold text-primary-dark/70">
          <a href="#tentang" className="hover:text-primary transition-colors">Tentang</a>
          <a href="#fitur" className="hover:text-primary transition-colors">Fitur</a>
          <a href="#statistik" className="hover:text-primary transition-colors">Statistik</a>
          <a href="#testimoni" className="hover:text-primary transition-colors">Testimoni</a>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {session ? (
            <Link href={session.user.role === 'guru' ? '/dashboard/teacher' : '/dashboard/student'}>
              <Button variant="primary" className="shadow-xl">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <span className="font-nunito font-extrabold text-primary-dark/60 hover:text-primary cursor-pointer transition-colors">
                  Masuk
                </span>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="shadow-xl">Mulai Gratis</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)} 
          className="md:hidden p-1.5 hover:bg-primary-bg/20 rounded-xl transition-colors cursor-pointer text-primary-dark"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-[75px] left-0 right-0 z-40 bg-white border-b-3 border-primary-bg p-6 space-y-6 flex flex-col font-nunito font-extrabold shadow-lg select-none">
          <a href="#tentang" onClick={() => setMenuOpen(false)} className="block text-lg hover:text-primary">Tentang</a>
          <a href="#fitur" onClick={() => setMenuOpen(false)} className="block text-lg hover:text-primary">Fitur</a>
          <a href="#statistik" onClick={() => setMenuOpen(false)} className="block text-lg hover:text-primary">Statistik</a>
          <a href="#testimoni" onClick={() => setMenuOpen(false)} className="block text-lg hover:text-primary">Kisah Sukses</a>
          <div className="border-t-2 border-primary-bg/20 pt-4 flex flex-col gap-4">
            {session ? (
              <Link href={session.user.role === 'guru' ? '/dashboard/teacher' : '/dashboard/student'}>
                <Button variant="primary" className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">Masuk</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" className="w-full">Daftar Sekarang</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="px-6 py-32 md:py-48 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/40 px-5 py-2 rounded-full font-nunito font-black text-[10px] uppercase tracking-[0.15em] text-primary select-none shadow-sm">
            <Sparkles className="w-4 h-4 text-primary-teal" />
            <span>Eco-Learning Masa Depan</span>
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-nunito font-extrabold tracking-tight leading-[1.1] text-primary-dark">
            Wujudkan <span className="bg-linear-to-r from-primary-teal to-primary bg-clip-text text-transparent">Bumi Hijau</span> Bersama Eco!
          </h2>
          <p className="text-xl font-nunito font-semibold text-primary-dark/60 leading-relaxed max-w-xl mx-auto md:mx-0">
            Smart EcoKids mengajarkan anak peduli lingkungan lewat AI, permainan sortir sampah, dan kuis edukatif yang memikat!
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start pt-4">
            <Link href="/register">
              <Button variant="primary" className="px-10 py-5 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 group">
                Mulai Petualangan <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#fitur">
              <Button variant="secondary" className="px-10 py-5 text-xl w-full border-none bg-white/40 shadow-xl shadow-gray-200/20">
                Jelajahi Fitur
              </Button>
            </a>
          </div>
        </div>
        
        {/* Animated Flying Mascot Illustration */}
        <div className="flex justify-center items-center relative select-none scale-110">
          <div className="absolute w-[450px] h-[450px] bg-linear-to-tr from-primary-teal/30 to-primary-lime/20 rounded-full blur-[100px] -z-10 animate-pulse" />
          <div className="animate-float">
            <EcoMascot size={320} />
          </div>
        </div>
      </section>

      {/* 3. Tentang Section (3 Cards) */}
      <section id="tentang" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-6 mb-20">
          <h3 className="text-4xl sm:text-5xl font-nunito font-extrabold text-primary-dark tracking-tight">
            Mengapa Smart EcoKids?
          </h3>
          <p className="text-xl font-nunito font-semibold text-primary-dark/40 max-w-2xl mx-auto">
            Kami membangun pilar edukasi terbaik untuk pahlawan bumi masa depan.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <Card className="flex flex-col items-center text-center p-10 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-primary-teal/20 to-primary-teal/10 flex items-center justify-center text-primary">
              <BookOpen className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-nunito font-extrabold">Interaktif</h4>
            <p className="text-base font-nunito font-semibold text-primary-dark/50 leading-relaxed">
              Materi visual yang mudah dipahami anak untuk mengenal dampak sampah bagi bumi.
            </p>
          </Card>

          <Card className="flex flex-col items-center text-center p-10 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-primary-green/20 to-primary-green/10 flex items-center justify-center text-primary-green">
              <Gamepad2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-nunito font-extrabold">Edukasi Game</h4>
            <p className="text-base font-nunito font-semibold text-primary-dark/50 leading-relaxed">
              Permainan sortir sampah dan kuis seru yang memacu kreativitas belajar anak.
            </p>
          </Card>

          <Card className="flex flex-col items-center text-center p-10 space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-primary-lime/20 to-primary-lime/10 flex items-center justify-center text-primary">
              <Camera className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-nunito font-extrabold">Aksi Nyata</h4>
            <p className="text-base font-nunito font-semibold text-primary-dark/50 leading-relaxed">
              Gunakan kamera AI untuk memilah sampah secara langsung di dunia nyata.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. Cara Kerja (3 Steps) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h3 className="text-3xl sm:text-4xl font-nunito font-extrabold text-primary-dark">
            Tiga Langkah Mudah Pahlawan Bumi
          </h3>
          <p className="text-lg font-nunito font-semibold text-primary-dark/70 max-w-2xl mx-auto">
            Mulailah menjaga bumi hari ini dalam waktu kurang dari 5 menit!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 select-none relative">
          <div className="flex flex-col items-center text-center space-y-4 z-10">
            <div className="w-20 h-20 rounded-full bg-primary border-4 border-white flex items-center justify-center text-white text-3xl font-nunito font-black shadow-md">
              01
            </div>
            <h4 className="text-xl font-nunito font-bold">Buat Akun Siswa</h4>
            <p className="text-sm font-sans font-medium text-primary-dark/75 max-w-xs leading-relaxed">
              Daftarkan diri dengan mudah dan dapatkan mascot Eco personalmu yang siap memandu.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 z-10">
            <div className="w-20 h-20 rounded-full bg-primary-hover border-4 border-white flex items-center justify-center text-white text-3xl font-nunito font-black shadow-md">
              02
            </div>
            <h4 className="text-xl font-nunito font-bold">Foto Sampah Sekitarmu</h4>
            <p className="text-sm font-sans font-medium text-primary-dark/75 max-w-xs leading-relaxed">
              Gunakan kamera untuk men-scan sampah. AI pintar kami akan memilah jenisnya dalam sekejap!
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-4 z-10">
            <div className="w-20 h-20 rounded-full bg-primary-dark border-4 border-white flex items-center justify-center text-white text-3xl font-nunito font-black shadow-md">
              03
            </div>
            <h4 className="text-xl font-nunito font-bold">Dapatkan Lencana & Poin</h4>
            <p className="text-sm font-sans font-medium text-primary-dark/75 max-w-xs leading-relaxed">
              Selesaikan kuis, pilah sampah, dan dapatkan lencana keren untuk ditunjukkan ke teman-temanmu!
            </p>
          </div>
        </div>
      </section>

      {/* 5. Fitur Section (6 Cards) */}
      <section id="fitur" className="bg-primary-bg/35 py-20 px-6 border-y-4 border-primary-bg/40">
        <div className="max-w-7xl mx-auto text-center space-y-4 mb-16">
          <h3 className="text-3xl sm:text-4xl font-nunito font-extrabold text-primary-dark">
            Dunia Belajar & Petualangan Lengkap
          </h3>
          <p className="text-lg font-nunito font-semibold text-primary-dark/70 max-w-2xl mx-auto">
            Jelajahi petualangan interaktif ramah anak yang dirancang untuk keceriaan edukasi penuh.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <Card key={feat.name} className="flex flex-col items-start p-7 space-y-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: feat.color }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-nunito font-bold">{feat.name}</h4>
                <p className="text-sm font-sans font-medium text-primary-dark/80 leading-relaxed">
                  {feat.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 6. Statistik Section */}
      <section id="statistik" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 select-none text-center">
          {stats.map((s) => (
            <div key={s.label} className="space-y-2 p-6 rounded-3xl bg-white border-3 border-primary-bg/50 shadow-[0_6px_0_0_var(--color-primary-bg)]">
              <p className="text-4xl sm:text-5xl font-nunito font-black text-primary">{s.value}</p>
              <p className="text-sm font-nunito font-bold text-primary-dark uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Testimoni Section (3 Cards) */}
      <section id="testimoni" className="bg-white py-20 px-6 border-t-4 border-primary-bg/40">
        <div className="max-w-7xl mx-auto text-center space-y-4 mb-16">
          <h3 className="text-3xl sm:text-4xl font-nunito font-extrabold text-primary-dark">
            Kisah Sukses Pahlawan Cilik
          </h3>
          <p className="text-lg font-nunito font-semibold text-primary-dark/70 max-w-2xl mx-auto">
            Lihat bagaimana Smart EcoKids mengubah pemikiran guru dan anak-anak tentang sampah.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <Card key={idx} className="flex flex-col p-8 justify-between space-y-6 relative">
              <Quote className="w-10 h-10 text-primary-bg absolute top-4 right-4 -z-1" />
              <p className="text-base font-sans font-medium text-primary-dark/85 italic leading-relaxed z-10">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-hover flex items-center justify-center font-nunito font-black text-white shadow-sm">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-nunito font-bold text-sm text-primary-dark">{t.name}</h4>
                  <p className="text-xs text-primary font-semibold">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 8. Banner CTA */}
      <section className="px-6 py-16 select-none bg-linear-to-tr from-primary to-primary-hover border-y-4 border-primary-dark/20 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-nunito font-black leading-tight">
            Ayo Bergabung Bersama Kami Menjaga Bumi!
          </h3>
          <p className="text-base sm:text-lg font-nunito font-semibold text-white/90 max-w-xl mx-auto leading-relaxed">
            Dunia Lestari menantimu. Daftarkan dirimu secara gratis dan mulailah petualangan belajarmu hari ini.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <button className="bg-white text-primary-dark hover:bg-primary-bg/20 font-nunito font-black text-lg py-4 px-10 rounded-2xl border-b-6 border-primary-bg/50 transition-all cursor-pointer active:scale-95 active:border-b-3 active:translate-y-0.5 shadow-md">
                Daftar Gratis Sekarang!
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-primary-dark text-primary-bg py-12 px-6 border-t-4 border-primary-dark/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div className="space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <EcoMascot size={36} />
              <h4 className="text-xl font-nunito font-black text-white">EcoKids</h4>
            </div>
            <p className="text-xs font-sans font-medium text-primary-bg/80 leading-relaxed max-w-xs mx-auto md:mx-0">
              Media edukasi interaktif ramah anak untuk melestarikan lingkungan semenjak dini demi masa depan bumi kita.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-nunito font-bold text-white uppercase tracking-wider">Akses Cepat</h4>
            <div className="flex flex-col gap-1 text-xs font-semibold">
              <a href="#tentang" className="hover:text-white transition-colors">Tentang Kami</a>
              <a href="#fitur" className="hover:text-white transition-colors">Fitur Aplikasi</a>
              <a href="#statistik" className="hover:text-white transition-colors">Statistik Utama</a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-nunito font-bold text-white uppercase tracking-wider">Kontak</h4>
            <p className="text-xs text-primary-bg/80 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-3.5 h-3.5" />
              peduli@smart-ecokids.sch.id
            </p>
            <p className="text-xs text-primary-bg/80 flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-3.5 h-3.5" />
              LIDM Project, Indonesia
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-primary-bg/10 mt-8 pt-6 text-center text-xs font-medium text-primary-bg/50">
          &copy; {new Date().getFullYear()} Smart EcoKids. Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}

