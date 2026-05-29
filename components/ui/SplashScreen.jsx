import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const dotVariants = {
    animate: (i) => ({
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        delay: i * 0.15,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div className="fixed inset-0 bg-primary-bg/90 backdrop-blur-xl flex flex-col items-center justify-center z-[9999] gap-8 select-none">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary-hover/20 blur-3xl rounded-full" />
        <Image 
          src="/icon.svg" 
          alt="EcoKids Icon" 
          width={120} 
          height={120} 
          className="relative z-10 drop-shadow-2xl animate-float"
        />
      </motion.div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="text-primary-dark font-nunito font-black text-2xl tracking-tight">
          Menyiapkan Dunia Eco...
        </h2>
        
        {/* Animated Loading Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={dotVariants}
              animate="animate"
              className="w-3.5 h-3.5 bg-linear-to-tr from-primary-teal to-primary rounded-full shadow-lg shadow-primary/20"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
