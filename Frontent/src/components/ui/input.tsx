import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string }>;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', icon: Icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        )}
        <input
          type={type}
          className={`flex h-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 transition-colors file:border-0 file:bg-transparent file:text-xs file:font-semibold placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            Icon ? 'pl-9' : ''
          } ${className}`}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';
