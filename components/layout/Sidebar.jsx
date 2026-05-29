import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import EcoMascot from '../ui/EcoMascot';
import { 
  Home, Camera, Gamepad2, 
  BookOpen, Compass, History, User, LogOut,
  ChevronLeft, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const role = session?.user?.role || 'siswa';
  const dashboardLink = role === 'guru' ? '/dashboard/teacher' : '/dashboard/student';

  const menuItems = [
    { name: 'Beranda', path: dashboardLink, icon: Home },
    { name: 'Scanner AI', path: '/scanner', icon: Camera, hideForGuru: true },
    { name: 'Game Sortir', path: '/game', icon: Gamepad2, hideForGuru: true },
    { name: 'Misi Belajar', path: '/education', icon: BookOpen },
    { name: 'Panduan DIY', path: '/guide', icon: Compass },
    { name: 'Riwayat Scan', path: '/history', icon: History, hideForGuru: true },
    { name: 'Profil Saya', path: '/profile', icon: User },
  ];

  return (
    <aside 
      className="hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/30 h-screen fixed top-0 left-0 z-40 select-none shadow-2xl shadow-gray-200/50 w-[320px]"
    >
      <div className="flex flex-col h-full w-[320px] overflow-hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-4 mb-12 px-8 pt-10">
          <EcoMascot size={54} />
          <div>
            <h1 className="text-2xl font-nunito font-extrabold tracking-tight text-primary-dark leading-none mb-1.5">
              EcoKids
            </h1>
            <span className="text-[10px] font-nunito font-black text-primary uppercase tracking-[0.2em] opacity-70">
              Dunia Lestari
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-2.5 px-6 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            if (item.hideForGuru && role === 'guru') return null;
            const isActive = router.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-4 px-4 py-4 rounded-[20px] font-nunito font-extrabold text-[15px] transition-all duration-300 cursor-pointer group relative
                  ${isActive 
                    ? 'bg-linear-to-r from-primary-teal to-primary text-white shadow-lg shadow-primary/30' 
                    : 'text-primary-dark/60 hover:text-primary hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-6 mt-auto">
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-[20px] font-nunito font-extrabold text-[15px] text-rose-500 hover:bg-rose-50 transition-all duration-300 cursor-pointer group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
