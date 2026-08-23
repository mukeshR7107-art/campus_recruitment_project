import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hoverEffect?: boolean;
}

export default function Card({ children, className = '', padding = true, hoverEffect = false }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-card transition-all duration-200 ${hoverEffect ? 'hover:shadow-card-hover hover:border-slate-300' : ''} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
