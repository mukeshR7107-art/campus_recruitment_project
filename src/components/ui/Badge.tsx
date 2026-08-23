import { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'brand' | 'purple';

const variantClasses: Record<Variant, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-200/80 font-semibold',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80 font-semibold',
  error: 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold',
  info: 'bg-sky-50 text-sky-700 border-sky-200/80 font-semibold',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80 font-semibold',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200 font-medium',
  primary: 'bg-brand-500 text-white border-brand-500 font-semibold',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function jobTypeBadge(type: string): Variant {
  const normalized = type?.toUpperCase() ?? '';
  if (normalized.includes('FULL')) return 'brand';
  if (normalized.includes('INTERN')) return 'info';
  if (normalized.includes('PART')) return 'purple';
  if (normalized.includes('CONTRACT') || normalized.includes('FREELANCE')) return 'warning';
  return 'neutral';
}

export function applicationStatusBadge(status: string): Variant {
  const map: Record<string, Variant> = {
    SUBMITTED: 'info',
    APPLIED: 'info',
    REVIEWED: 'warning',
    SHORTLISTED: 'purple',
    INTERVIEWING: 'warning',
    OFFERED: 'brand',
    HIRED: 'brand',
    REJECTED: 'error',
  };
  return map[status] ?? 'neutral';
}

export function jobStatusBadge(status: string): Variant {
  return status === 'OPEN' || status === 'ACTIVE' ? 'brand' : 'neutral';
}
