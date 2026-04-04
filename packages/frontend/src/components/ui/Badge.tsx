import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-surface border border-sun text-sun',
      success: 'bg-green-900/30 border border-green-500 text-green-400',
      warning: 'bg-yellow-900/30 border border-yellow-500 text-yellow-400',
      error: 'bg-red-900/30 border border-red-500 text-red-400',
      info: 'bg-blue-900/30 border border-blue-500 text-blue-400',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-200',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
