import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Input from '../ui/Input';
import Button from '../ui/Button';
import EcoMascot from '../ui/EcoMascot';
import { useToast } from '../../context/ToastContext';
import { Award, GraduationCap } from 'lucide-react';

export default function RegisterForm() {
  const router = useRouter();
  const { addToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('siswa'); // default 'siswa'
  const [schoolName, setSchoolName] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    
    if (!fullName.trim()) {
      tempErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (fullName.length < 2 || fullName.length > 100) {
      tempErrors.fullName = 'Nama lengkap harus antara 2–100 karakter';
    }

    if (!email) {
      tempErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Format email tidak valid';
    } else if (email.length > 255) {
      tempErrors.email = 'Email maksimal 255 karakter';
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!password) {
      tempErrors.password = 'Password wajib diisi';
    } else if (password.length < 8) {
      tempErrors.password = 'Password minimal 8 karakter';
    } else if (!hasUppercase || !hasLowercase || !hasNumber) {
      tempErrors.password = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (confirmPassword !== password) {
      tempErrors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    if (!role) {
      tempErrors.role = 'Silakan pilih peranmu';
    }

    if (schoolName && schoolName.length > 100) {
      tempErrors.schoolName = 'Nama sekolah maksimal 100 karakter';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast({ message: 'Harap periksa isian formulir', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
          schoolName: schoolName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: 'Email ini sudah digunakan. Silakan login.' });
          addToast({ message: 'Email ini sudah digunakan. Silakan login.', type: 'error' });
        } else {
          setErrors({ server: data.error || 'Gagal mendaftar akun' });
          addToast({ message: data.error || 'Pendaftaran gagal', type: 'error' });
        }
      } else {
        addToast({ message: 'Akun berhasil dibuat! Silakan masuk.', type: 'success' });
        router.push('/login');
      }
    } catch (err) {
      addToast({ message: 'Terjadi kesalahan sistem saat mendaftar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div className="flex flex-col items-center gap-1 select-none">
        <EcoMascot size={75} className="animate-float" />
        <h2 className="text-2xl font-nunito font-extrabold text-primary-dark text-center">
          Daftar EcoKids
        </h2>
        <p className="text-sm font-nunito font-bold text-primary text-center">
          Bergabung menjaga kelestarian bumi kita!
        </p>
      </div>

      {errors.server && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 font-nunito font-bold text-sm px-4 py-3 rounded-2xl text-center">
          {errors.server}
        </div>
      )}

      {/* Role Picker (2 Clickable Cards) */}
      <div className="space-y-2 select-none">
        <label className="block text-base font-nunito font-bold text-primary-dark ml-1">
          Pilih Peranmu:
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setRole('siswa')}
            className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-center border-3 transition-all active:scale-95 text-center
              ${role === 'siswa'
                ? 'bg-primary-bg border-primary-hover shadow-[0_4px_0_0_var(--color-primary-hover)]'
                : 'bg-white border-primary-bg/50 hover:bg-primary-bg/20'
              }`}
          >
            <GraduationCap className={`w-8 h-8 mb-2 ${role === 'siswa' ? 'text-primary' : 'text-primary-dark/50'}`} />
            <span className="font-nunito font-extrabold text-primary-dark">Siswa</span>
            <span className="text-[10px] font-sans font-medium text-primary-dark/60 mt-1">Belajar & Bermain</span>
          </div>

          <div
            onClick={() => setRole('guru')}
            className={`cursor-pointer rounded-2xl p-4 flex flex-col items-center justify-center border-3 transition-all active:scale-95 text-center
              ${role === 'guru'
                ? 'bg-primary-bg border-primary shadow-[0_4px_0_0_var(--color-primary)]'
                : 'bg-white border-primary-bg/50 hover:bg-primary-bg/20'
              }`}
          >
            <Award className={`w-8 h-8 mb-2 ${role === 'guru' ? 'text-primary' : 'text-primary-dark/50'}`} />
            <span className="font-nunito font-extrabold text-primary-dark">Guru</span>
            <span className="text-[10px] font-sans font-medium text-primary-dark/60 mt-1">Pantau & Edukasi</span>
          </div>
        </div>
        {errors.role && <p className="text-red-500 font-nunito font-semibold text-sm mt-1">{errors.role}</p>}
      </div>

      <div className="space-y-3.5">
        <Input
          label="Nama Lengkap"
          id="fullName"
          type="text"
          placeholder="Siapa namamu?"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: null }));
          }}
          error={errors.fullName}
        />

        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="nama@sekolah.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors(prev => ({ ...prev, email: null }));
          }}
          error={errors.email}
        />

        <Input
          label="Nama Sekolah (Opsional)"
          id="schoolName"
          type="text"
          placeholder="Nama sekolahmu"
          value={schoolName}
          onChange={(e) => {
            setSchoolName(e.target.value);
            if (errors.schoolName) setErrors(prev => ({ ...prev, schoolName: null }));
          }}
          error={errors.schoolName}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Minimal 8 karakter (Huruf & Angka)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({ ...prev, password: null }));
          }}
          error={errors.password}
        />

        <Input
          label="Ulangi Password"
          id="confirmPassword"
          type="password"
          placeholder="Masukkan ulang password rahasiamu"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
          }}
          error={errors.confirmPassword}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full py-4 text-xl"
        disabled={loading}
      >
        {loading ? 'Daftar...' : 'Daftar Sekarang!'}
      </Button>

      <p className="text-center font-nunito font-bold text-sm text-primary-dark/85 mt-1">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Masuk saja!
        </Link>
      </p>
    </form>
  );
}
