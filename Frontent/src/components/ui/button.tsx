import React from 'react';

export type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'success';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs active:scale-[0.98] border border-blue-600 focus-visible:ring-blue-500',
  secondary:
    'bg-white text-slate-700 hover:bg-slate-50/80 hover:text-slate-900 border border-slate-200/90 shadow-2xs active:scale-[0.98] focus-visible:ring-slate-400',
  destructive:
    'bg-rose-50 text-rose-700 hover:bg-rose-100/90 border border-rose-200/80 active:scale-[0.98] focus-visible:ring-rose-500',
  outline:
    'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-200 focus-visible:ring-slate-400',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-transparent focus-visible:ring-slate-400',
  link:
    'text-blue-600 underline-offset-4 hover:underline border-transparent p-0 h-auto',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs active:scale-[0.98] border border-emerald-600 focus-visible:ring-emerald-500'
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'h-9 px-4 py-2 text-xs font-semibold rounded-xl',
  sm: 'h-8 px-3 text-xs font-semibold rounded-lg',
  lg: 'h-10 px-5 text-sm font-bold rounded-xl',
  icon: 'h-8 w-8 p-0 rounded-lg'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'default',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
