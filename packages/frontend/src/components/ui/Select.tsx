import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={clsx(
              'w-full px-4 py-2.5 bg-surface-2 border border-border rounded-lg text-gray-100 transition-colors duration-200 appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-sun focus:ring-offset-2 focus:ring-offset-dark-bg focus:border-sun',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'pr-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
