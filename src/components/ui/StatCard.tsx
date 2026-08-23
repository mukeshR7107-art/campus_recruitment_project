import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: 'brand' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

const colorClasses = {
  brand: 'bg-brand-50 text-brand-600 border border-brand-200/60',
  blue: 'bg-sky-50 text-sky-600 border border-sky-200/60',
  emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
  amber: 'bg-amber-50 text-amber-600 border border-amber-200/60',
  rose: 'bg-rose-50 text-rose-600 border border-rose-200/60',
  purple: 'bg-purple-50 text-purple-600 border border-purple-200/60',
};

export default function StatCard({ title, value, icon, trend, color = 'brand' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-semibold">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{value}</p>
          {trend && <p className="text-xs text-slate-500 mt-1.5 font-medium">{trend}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
