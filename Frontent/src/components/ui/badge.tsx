import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'
  | 'draft'
  | 'purple';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<BadgeVariant, { bg: string; dot: string }> = {
  default: {
    bg: 'bg-blue-600 text-white border-transparent',
    dot: 'bg-white'
  },
  secondary: {
    bg: 'bg-slate-100 text-slate-800 border-slate-200/80',
    dot: 'bg-slate-400'
  },
  outline: {
    bg: 'bg-transparent text-slate-700 border-slate-300',
    dot: 'bg-slate-500'
  },
  destructive: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200/70',
    dot: 'bg-rose-500'
  },
  success: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    dot: 'bg-emerald-500'
  },
  warning: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dot: 'bg-amber-500'
  },
  info: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
    dot: 'bg-blue-500'
  },
  draft: {
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400'
  },
  purple: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
    dot: 'bg-purple-500'
  }
};

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5 font-bold',
  md: 'text-xs px-2.5 py-0.5 font-semibold',
  lg: 'text-xs px-3 py-1 font-semibold'
};

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  dot = false,
  size = 'md',
  children,
  ...props
}) => {
  const currentVariant = variantStyles[variant] || variantStyles.default;
  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors select-none tracking-tight ${currentVariant.bg} ${currentSize} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dot}`}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  );
};
