export default function Badge({ children, color = 'default' }) {
  const colors = {
    default: 'bg-white/80 text-primary border border-primary-bg',
    organic: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200',
    inorganic: 'bg-primary text-white shadow-lg shadow-primary/30',
    warning: 'bg-amber-400 text-white shadow-lg shadow-amber-200',
  };
  return (
    <span className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-nunito font-extrabold tracking-tight select-none backdrop-blur-sm ${colors[color] || colors.default}`}>
      {children}
    </span>
  );
}
