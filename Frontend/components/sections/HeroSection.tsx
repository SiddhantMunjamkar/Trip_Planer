'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeroSectionProps {
  onGenerateTrip: (url: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function HeroSection({ onGenerateTrip, isLoading, error }: HeroSectionProps) {
  const [url, setUrl] = useState('');

  const handleGenerateClick = () => {
    if (url.trim() && !isLoading) {
      onGenerateTrip(url.trim());
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-slate-50 to-white px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-sans text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Turn Travel Videos into Personalized Itineraries
        </h1>
        <p className="mt-6 text-lg text-slate-600">
          Paste a YouTube or Instagram travel reel URL and let ReelTrip AI create your perfect trip plan.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-2">
          <Input
            type="url"
            placeholder="Paste your travel video URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateClick()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerateClick}
            disabled={!url.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isLoading ? 'Analyzing...' : 'Generate Trip'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">
          Example: https://youtube.com/watch?v=... or instagram.com/p/...
        </p>
      </div>
    </section>
  );
}
