'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import type { ExtractionData } from '@/lib/api';

interface ExtractionResultsProps {
  data: ExtractionData;
}

export function ExtractionResults({ data }: ExtractionResultsProps) {
  return (
    <section className="w-full border-t border-slate-200 bg-white px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900">We found amazing content!</h2>
          <p className="mt-2 text-slate-600">
            Here&apos;s what we extracted from your video using Gemini AI:
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Places Found */}
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Places Found</CardTitle>
              <CardDescription>Verified destinations ({data.places.length})</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.places.map((place) => (
                  <div
                    key={place}
                    className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-100"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-slate-900">{place}</p>
                  </div>
                ))}
                {data.places.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No specific places detected</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activities Found */}
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Activities Found</CardTitle>
              <CardDescription>Things to do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.activities.map((activity) => (
                  <Badge key={activity} variant="secondary" className="bg-green-100 text-green-800">
                    {activity}
                  </Badge>
                ))}
                {data.activities.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No activities detected</p>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Extracted by Gemini AI
              </p>
            </CardContent>
          </Card>

          {/* Travel Vibes */}
          <Card className="border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Travel Vibes</CardTitle>
              <CardDescription>Destination atmosphere</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.vibes.map((vibe) => (
                  <Badge key={vibe} variant="secondary" className="bg-purple-100 text-purple-800">
                    {vibe}
                  </Badge>
                ))}
                {data.vibes.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No vibes detected</p>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                AI-analyzed content
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
