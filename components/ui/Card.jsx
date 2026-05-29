import { cn } from '../../lib/utils';

export default function Card({ children, className = '' }) {
  return (
    <div className={cn("storybook-card p-6 bg-white", className)}>
      {children}
    </div>
  );
}
