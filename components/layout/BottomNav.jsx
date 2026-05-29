import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  Home, Camera, Gamepad2, Award, 
  User, BookOpen, Compass 
} from 'lucide-react';

export default function BottomNav() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const role = session?.user?.role || 'siswa';
  const dashboardLink = role === 'guru' ? '/dashboard/teacher' : '/dashboard/student';

  // Define menus for student
  const studentItems = [
    { name: 'Beranda', path: dashboardLink, icon: Home },
    { name: 'Game', path: '/game', icon: Gamepad2 },
    { name: 'Scan', path: '/scanner', icon: Camera, isCenter: true },
    { name: 'Misi', path: '/education', icon: BookOpen },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  // Define menus for teacher
  const teacherItems = [
    { name: 'Beranda', path: dashboardLink, icon: Home },
    { name: 'Belajar', path: '/education', icon: BookOpen },
    { name: 'DIY', path: '/guide', icon: Compass },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  const menuItems = role === 'guru' ? teacherItems : studentItems;

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 bg-white/80 backdrop-blur-xl border border-white/40 px-6 py-3 flex items-center justify-around rounded-[32px] shadow-2xl shadow-primary/10 select-none">
      {menuItems.map((item) => {
        const isActive = router.pathname === item.path;
        const Icon = item.icon;

        if (item.isCenter) {
          return (
            <Link key={item.path} href={item.path}>
              <div className="relative flex flex-col items-center cursor-pointer">
                {/* Elevated Circle */}
                <div className={`w-14 h-14 rounded-2xl bg-linear-to-tr from-primary-teal to-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 transition-all duration-300 active:scale-90
                  ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        }

        return (
          <Link key={item.path} href={item.path}>
            <div className={`flex flex-col items-center justify-center w-12 py-1 transition-all active:scale-95
              ${isActive ? 'text-primary' : 'text-primary-dark/40'}`}
            >
              <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-[9px] font-nunito font-black mt-1 uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.name}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
