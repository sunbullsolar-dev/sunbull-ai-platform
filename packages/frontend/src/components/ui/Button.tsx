import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-dm-sans font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-sun focus:ring-offset-2 focus:ring-offset-dark-bg',
  {
    variants: {
      variant: {
        primary:
          'bg-sun text-dark-bg hover:bg-sun-dim active:scale-95 shadow-lg hover:shadow-sun/50',
        secondary:
          'border-2 border-sun text-sun hover:bg-sun/10 active:scale-95',
        ghost: 'text-sun hover:bg-sun/10 active:scale-95',
        outline: 'border border-border text-gray-100 hover:bg-surface-2 active:scale-95',
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={clsx(
          buttonVariants({
            variant,
            size,
            fullWidth,
          }),
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
