'use client';

import React from 'react';
import { motion } from 'framer-motion';
import InstallCounter from '@/components/trust/InstallCounter';
import InstallerCredentials from '@/components/trust/InstallerCredentials';
import FounderStory from '@/components/trust/FounderStory';
import ReviewCarousel from '@/components/trust/ReviewCarousel';
import NeighborhoodMap from '@/components/trust/NeighborhoodMap';

const TrustBlock: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-16 space-y-12"
    >
      {/* Install Counter */}
      <div>
        <InstallCounter target={1500} location="San Fernando Valley" />
      </div>

      {/* Installer Credentials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InstallerCredentials />
        <FounderStory />
      </div>

      {/* Reviews */}
      <div>
        <h2 className="font-bebas text-3xl text-sun tracking-wide text-center mb-8">
          What Your Neighbors Say
        </h2>
        <ReviewCarousel />
      </div>

      {/* Map */}
      <div>
        <h2 className="font-bebas text-3xl text-sun tracking-wide text-center mb-8">
          Installation Locations
        </h2>
        <NeighborhoodMap />
      </div>
    </motion.div>
  );
};

export default TrustBlock;
