'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Calendar, Clock } from 'lucide-react';

interface InspectionSchedulerProps {
  onConfirm?: (date: string, time: string) => void;
  minDate?: Date;
  isLoading?: boolean;
}

const InspectionScheduler: React.FC<InspectionSchedulerProps> = ({
  onConfirm,
  minDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isLoading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');

  const timeSlots = [
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  // Generate next 30 days
  const dates = Array.from({ length: 30 }).map((_, i) => {
    const date = new Date(minDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-12"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bebas text-4xl text-sun tracking-wide mb-2">
            Schedule Your Inspection
          </h1>
          <p className="text-gray-400">
            Select a date and time that works best for you
          </p>
        </div>

        {/* Date Selection */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-sun" />
            <h2 className="font-bebas text-lg text-sun tracking-wide">
              Select Date
            </h2>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDate === dateStr
                      ? 'bg-sun text-dark-bg'
                      : 'bg-surface border border-border text-gray-300 hover:border-sun'
                  }`}
                >
                  <div className="text-xs opacity-70">{dayName}</div>
                  <div>{dayNum}</div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Time Selection */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-sun" />
            <h2 className="font-bebas text-lg text-sun tracking-wide">
              Select Time
            </h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTime === time
                    ? 'bg-sun text-dark-bg'
                    : 'bg-surface border border-border text-gray-300 hover:border-sun'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </Card>

        {/* Summary */}
        {selectedDate && (
          <Card className="bg-surface-2">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Your Inspection is scheduled for:</p>
              <p className="text-2xl font-bebas text-sun mb-4">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                at {selectedTime}
              </p>
              <p className="text-xs text-gray-500">
                Our technician will arrive within a 2-hour window
              </p>
            </div>
          </Card>
        )}

        {/* CTA */}
        <Button
          fullWidth
          disabled={!selectedDate || !selectedTime}
          onClick={() => onConfirm?.(selectedDate, selectedTime)}
          isLoading={isLoading}
        >
          Confirm Inspection
        </Button>
      </div>
    </motion.div>
  );
};

export default InspectionScheduler;
