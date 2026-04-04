import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  animated = true,
  className,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={clsx('w-full', className)}>
      <div className="w-full bg-surface-2 rounded-full overflow-hidden border border-border h-2">
        <motion.div
          className={clsx(
            'h-full bg-sun rounded-full',
            animated && 'bg-gradient-to-r from-sun to-sun-dim'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <span>Progress</span>
          <span className="text-sun font-semibold">{clampedProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
