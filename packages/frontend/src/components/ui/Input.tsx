import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  subLabel?: string;
  error?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, subLabel, error, containerClassName, className, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-2">
            {label}
            {subLabel && (
              <span className="text-xs text-gray-400 block font-normal mt-1">
                {subLabel}
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-4 py-2.5 bg-surface-2 border border-border rounded-lg text-gray-100 placeholder-gray-500 transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-sun focus:ring-offset-2 focus:ring-offset-dark-bg focus:border-sun',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500 focus:ring-offset-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
