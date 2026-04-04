'use client';

import React from 'react';
import Card from '@/components/ui/Card';

interface FounderStoryProps {
  name?: string;
  story?: string;
}

const FounderStory: React.FC<FounderStoryProps> = ({
  name = 'Abdo Yaghi',
  story = "Founded Sunbull AI to solve the solar problem: outdated processes that waste homeowners' time. We built an AI-first platform that generates accurate proposals in 2 minutes, not 2 weeks. Our mission: make solar accessible to every homeowner.",
}) => {
  return (
    <Card className="bg-surface-2 border-sun/20">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-sun/20 border border-sun flex items-center justify-center">
          <span className="text-2xl font-bebas text-sun">A</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bebas text-lg text-sun tracking-wide mb-2">
            {name}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">{story}</p>
        </div>
      </div>
    </Card>
  );
};

export default FounderStory;
