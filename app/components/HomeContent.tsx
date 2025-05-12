'use client';

import LandingPage from './LandingPage';

interface HomeContentProps {
  lng: string;
}

export default function HomeContent({ lng }: HomeContentProps) {
  return <LandingPage lng={lng} />;
} 