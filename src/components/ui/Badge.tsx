import { ReactNode } from 'react';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

const variantClasses: Record<Variant, string> = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-sky-100 text-sky-700 border-sky-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
  primary: 'bg-blue-100 text-blue-700 border-blue-200',
};

interface BadgeProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function applicationStatusBadge(status: string) {
  const map: Record<string, Variant> = {
    APPLIED: 'info',
    REVIEWED: 'warning',
    SHORTLISTED: 'primary',
    REJECTED: 'error',
    HIRED: 'success',
  };
  return map[status] ?? 'neutral';
}

export function jobStatusBadge(status: string) {
  return status === 'OPEN' ? 'success' : ('neutral' as Variant);
}
