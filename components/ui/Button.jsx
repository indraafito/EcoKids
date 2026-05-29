import { cn } from '../../lib/utils';

export default function Button({ children, variant = 'primary', onClick, className = '', disabled = false, type = 'button' }) {
  const base = 'inline-flex items-center justify-center rounded-full py-3.5 px-8 font-nunito font-extrabold text-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';
  
  const variants = {
    primary: 'storybook-btn-primary text-white',
    secondary: 'bg-white/80 backdrop-blur-md text-primary border border-primary-bg hover:bg-white shadow-lg shadow-primary-bg/20',
    danger: 'bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-200 hover:brightness-105',
    ghost: 'bg-transparent text-primary-dark hover:bg-white/50',
  };
  
  return (
    <button
      type={type}
      className={cn(base, variants[variant], className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
