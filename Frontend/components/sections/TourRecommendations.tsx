'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign } from 'lucide-react';
import type { Tour } from '@/lib/api';

interface TourRecommendationsProps {
  tours: Tour[];
}

const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700',
  culture: 'bg-amber-100 text-amber-700',
  adventure: 'bg-green-100 text-green-700',
  nightlife: 'bg-purple-100 text-purple-700',
  wellness: 'bg-blue-100 text-blue-700',
  photography: 'bg-pink-100 text-pink-700',
};

export function TourRecommendations({ tours }: TourRecommendationsProps) {
  if (!tours || tours.length === 0) return null;

  return (
    <section className="w-full border-t border-slate-200 bg-white px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Recommended Add-ons</h2>
          <p className="text-slate-600">
            Curated experiences matched to your travel style and destination vibes.
          </p>
        </div>

        <div className="space-y-3">
          {tours.map((tour, index) => (
            <Card key={index} className="border border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        ✓
                      </span>
                      <h3 className="font-semibold text-slate-900">{tour.name}</h3>
                      <Badge
                        variant="secondary"
                        className={`text-xs capitalize ${CATEGORY_COLORS[tour.category] || 'bg-slate-100 text-slate-700'}`}
                      >
                        {tour.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{tour.description}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {tour.duration}
                      </span>
                    </div>
                  </div>

                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-2xl font-bold text-blue-600">
                      ${tour.estimatedCost}
                    </p>
                    <p className="text-xs text-slate-600">per person</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-slate-600 mt-8 text-center">
          Add these experiences to create your perfect itinerary
        </p>
      </div>
    </section>
  );
}
