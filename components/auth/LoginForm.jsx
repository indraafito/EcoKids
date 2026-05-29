import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Input from '../ui/Input';
import Button from '../ui/Button';
import EcoMascot from '../ui/EcoMascot';
import { useToast } from '../../context/ToastContext';

export default function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Format email tidak valid';
    }
    if (!password) {
      tempErrors.password = 'Password wajib diisi';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result.error) {
        addToast({ message: 'Email atau password salah', type: 'error' });
        setErrors({ server: 'Email atau password salah' });
      } else {
        addToast({ message: 'Selamat datang kembali!', type: 'success' });
        // Retrieve session to check role
        const res = await fetch('/api/auth/session');
        const session = await res.json();
        
        if (session?.user?.role === 'guru') {
          router.push('/dashboard/teacher');
        } else {
          router.push('/dashboard/student');
        }
      }
    } catch (err) {
      addToast({ message: 'Terjadi kesalahan sistem', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="flex flex-col items-center gap-2 mb-4 select-none">
        <EcoMascot size={90} className="animate-float" />
        <h2 className="text-2xl font-nunito font-extrabold text-primary-dark text-center">
          Masuk ke EcoKids
        </h2>
        <p className="text-sm font-nunito font-bold text-primary text-center">
          Belajar & bermain melestarikan bumi!
        </p>
      </div>

      {errors.server && (
        <div className="bg-red-50 border-2 border-red-200 text-red-700 font-nunito font-bold text-sm px-4 py-3 rounded-2xl text-center">
          {errors.server}
        </div>
      )}

      <div className="space-y-4">
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
          label="Password"
          id="password"
          type="password"
          placeholder="Masukkan password rahasiamu"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => ({ ...prev, password: null }));
          }}
          error={errors.password}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full py-4 text-xl"
        disabled={loading}
      >
        {loading ? 'Masuk...' : 'Ayo Masuk!'}
      </Button>

      <p className="text-center font-nunito font-bold text-sm text-primary-dark/85 mt-2">
        Belum punya akun?{' '}
        <Link href="/register" className="text-primary hover:underline">
          Daftar di sini!
        </Link>
      </p>
    </form>
  );
}
