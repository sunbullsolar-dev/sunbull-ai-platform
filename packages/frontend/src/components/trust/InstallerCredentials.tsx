'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';

interface InstallerCredentialsProps {
  name?: string;
  license?: string;
  yearsExperience?: number;
  certifications?: string[];
}

const InstallerCredentials: React.FC<InstallerCredentialsProps> = ({
  name = 'Licensed Solar Installers',
  license = 'CA License #12345',
  yearsExperience = 15,
  certifications = ['NABCEP Certified', 'Electrical License', 'Bond & Insured'],
}) => {
  return (
    <Card className="bg-surface-2 border-sun/20">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-sun/20 border border-sun flex items-center justify-center">
          <span className="text-xl font-bebas text-sun">⚡</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bebas text-lg text-sun tracking-wide">{name}</h3>
          <p className="text-sm text-gray-400 mt-1">{license}</p>
          <p className="text-sm text-gray-400">{yearsExperience}+ years experience</p>
        </div>
      </div>
      <div className="space-y-2">
        {certifications.map((cert) => (
          <div key={cert} className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sun flex-shrink-0" />
            <span className="text-sm text-gray-300">{cert}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InstallerCredentials;
