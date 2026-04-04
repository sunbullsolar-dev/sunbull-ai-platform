'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  status: 'completed' | 'current' | 'pending';
  expectedDate?: string;
  actualDate?: string;
}

interface PipelineTrackerProps {
  stages?: Stage[];
  dealId?: string;
}

const defaultStages: Stage[] = [
  {
    id: '1',
    name: 'Contract Signed',
    status: 'completed',
    expectedDate: '2024-04-03',
    actualDate: '2024-04-03',
  },
  {
    id: '2',
    name: 'Roof Inspection',
    status: 'current',
    expectedDate: '2024-04-10',
  },
  {
    id: '3',
    name: 'Permit Application',
    status: 'pending',
    expectedDate: '2024-04-20',
  },
  {
    id: '4',
    name: 'Permitting',
    status: 'pending',
    expectedDate: '2024-05-10',
  },
  {
    id: '5',
    name: 'Installation',
    status: 'pending',
    expectedDate: '2024-05-20',
  },
  {
    id: '6',
    name: 'Final Inspection',
    status: 'pending',
    expectedDate: '2024-05-25',
  },
  {
    id: '7',
    name: 'PTO (Permission to Operate)',
    status: 'pending',
    expectedDate: '2024-06-10',
  },
  {
    id: '8',
    name: 'System Live',
    status: 'pending',
    expectedDate: '2024-06-15',
  },
];

const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  stages = defaultStages,
  dealId,
}) => {
  return (
    <div className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-bebas text-4xl text-sun tracking-widest mb-2">
            Your Solar Timeline
          </h1>
          <p className="text-gray-400">Track your installation progress</p>
        </div>

        {/* Pipeline */}
        <Card className="p-8">
          <div className="space-y-4">
            {stages.map((stage, idx) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <div className="flex gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className="relative flex items-center justify-center">
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : stage.status === 'current' ? (
                        <div className="w-6 h-6 rounded-full border-2 border-sun bg-sun/20 animate-pulse" />
                      ) : (
                        <Circle className="w-6 h-6 border-2 border-border" />
                      )}
                    </div>
                    {idx !== stages.length - 1 && (
                      <div
                        className={`w-0.5 h-16 ${
                          stage.status === 'completed' || stage.status === 'current'
                            ? 'bg-sun'
                            : 'bg-border'
                        }`}
                      />
                    )}
                  </div>

                  {/* Stage info */}
                  <div className="pb-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`font-medium ${
                          stage.status === 'current'
                            ? 'text-sun'
                            : stage.status === 'completed'
                            ? 'text-green-400'
                            : 'text-gray-300'
                        }`}
                      >
                        {stage.name}
                      </h3>
                      <Badge
                        variant={
                          stage.status === 'completed'
                            ? 'success'
                            : stage.status === 'current'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {stage.status === 'completed'
                          ? 'Completed'
                          : stage.status === 'current'
                          ? 'In Progress'
                          : 'Coming Soon'}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-6 text-xs text-gray-400">
                      {stage.expectedDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Expected:{' '}
                            {new Date(stage.expectedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {stage.actualDate && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            Completed:{' '}
                            {new Date(stage.actualDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Current Stage Details */}
        {stages.find((s) => s.status === 'current') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-sun/10 border-sun">
              <h2 className="font-bebas text-xl text-sun tracking-wide mb-4">
                What's Next
              </h2>
              <p className="text-gray-300 mb-4">
                {stages.find((s) => s.status === 'current')?.name} is currently in progress.
                Our team will notify you when the next stage begins.
              </p>
              <p className="text-sm text-gray-400">
                Expected next stage by{' '}
                {stages.find((s) => s.status === 'pending')?.expectedDate
                  ? new Date(
                      stages.find((s) => s.status === 'pending')?.expectedDate || ''
                    ).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'soon'}
              </p>
            </Card>
          </motion.div>
        )}

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-gray-500 pt-8 border-t border-border"
        >
          <p>
            Questions about your installation?{' '}
            <a href="mailto:support@sunbull.ai" className="text-sun hover:text-sun-dim">
              Contact support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PipelineTracker;
