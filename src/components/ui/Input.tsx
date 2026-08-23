import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export default function Input({ label, error, hint, icon, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            ${icon ? 'pl-9' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = '', ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
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
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
