import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EcoMascot from '../ui/EcoMascot';
import SplashScreen from '../ui/SplashScreen';
import useMediaQuery from '../../hooks/useMediaQuery';

export default function LayoutWrapper({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Define routes that shouldn't show any sidebar/navigation
  const isGuestRoute = ['/', '/login', '/register'].includes(router.pathname);
  
  // Redirect authenticated users away from guest routes (Login/Register)
  useEffect(() => {
    if (status === 'authenticated' && (router.pathname === '/login' || router.pathname === '/register')) {
      router.replace('/dashboard');
    }
  }, [status, router]);

  // Show nav only if authenticated AND not on a guest route
  const showNav = status === 'authenticated' && !isGuestRoute;

  // Handle Loading state
  if (status === 'loading') {
    return <SplashScreen />;
  }

  return (
    <div className="h-screen w-full bg-transparent flex flex-col md:flex-row overflow-hidden relative">
      {/* Sidebar for Desktop */}
      {showNav && <Sidebar />}

      {/* Main Page Area */}
      <motion.div 
        animate={{ 
          marginLeft: (isDesktop && showNav) ? 320 : 0
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 flex flex-col h-full relative overflow-hidden"
      >
        
        {/* Mobile Header (Only visible if authenticated on mobile and not a guest route) */}
        {showNav && (
          <header className="md:hidden flex items-center justify-between px-6 py-5 bg-white/70 backdrop-blur-xl border-b border-white/30 select-none sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
              <EcoMascot size={40} />
              <h1 className="text-xl font-nunito font-extrabold text-primary-dark tracking-tight">
                EcoKids
              </h1>
            </div>
            {session?.user && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-primary-teal to-primary p-[2px] shadow-lg shadow-primary/20">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center font-nunito font-extrabold text-primary text-sm">
                    {session.user.name?.charAt(0).toUpperCase() || 'E'}
                  </div>
                </div>
              </div>
            )}
          </header>
        )}

        {/* Content Panel - This is the only part that scrolls */}
        <main className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${isGuestRoute ? 'p-0 max-w-none' : 'p-4 sm:p-6 md:p-10 max-w-7xl'} w-full mx-auto pb-24 md:pb-10`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={router.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* BottomNav for Mobile */}
      {showNav && <BottomNav />}
    </div>
  );
}
