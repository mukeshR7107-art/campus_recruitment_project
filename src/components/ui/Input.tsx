import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export default function Input({ label, error, hint, icon, className = '', ...props }: InputProps) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          aria-invalid={!!error}
          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400'}
            ${icon ? 'pl-10' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>}
      <textarea
        id={inputId}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm resize-none
          disabled:bg-slate-50 disabled:text-slate-500
          ${error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, hint, options, placeholder, className = '', ...props }: SelectProps) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={inputId} className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>}
      <select
        id={inputId}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-sm
          disabled:bg-slate-50 disabled:text-slate-500
          ${error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-300 hover:border-slate-400'}
          ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
