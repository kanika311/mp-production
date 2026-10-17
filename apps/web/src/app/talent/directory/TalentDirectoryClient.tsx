'use client';

import React from 'react';
import TalentDiscoveryFeed, { TalentItem } from '@/components/talent/TalentDiscoveryFeed';

interface TalentDirectoryClientProps {
  initialTalents: TalentItem[];
}

export default function TalentDirectoryClient({ initialTalents }: TalentDirectoryClientProps) {
  return (
    <div className="w-full">
      <TalentDiscoveryFeed initialTalents={initialTalents} />
    </div>
  );
}
