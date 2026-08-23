import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'dark' | 'danger' | 'ghost' | 'outline' | 'outline-white';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-md shadow-brand-500/25 focus:ring-brand-400',
  secondary: 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 focus:ring-slate-400',
  dark: 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-md focus:ring-slate-700',
  danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus:ring-rose-400',
  ghost: 'hover:bg-slate-100 text-slate-700 focus:ring-slate-400',
  outline: 'border border-slate-200 hover:border-brand-500 hover:text-brand-600 text-slate-700 bg-white focus:ring-brand-400',
  'outline-white': 'border-2 border-white/80 hover:bg-white hover:text-slate-900 text-white backdrop-blur-sm focus:ring-white/50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2 text-sm font-semibold rounded-xl',
  lg: 'px-6 py-3 text-base font-semibold rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : icon}
      {children}
    </button>
  );
}
