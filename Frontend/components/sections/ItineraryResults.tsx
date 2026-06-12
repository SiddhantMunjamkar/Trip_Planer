'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Star, Utensils, BedDouble } from 'lucide-react';
import type { FullTripResult, TripPlan, RankedHotel, RankedRestaurant } from '@/lib/api';

type Tier = 'budget' | 'comfort' | 'luxury';

interface ItineraryResultsProps {
  result: FullTripResult;
  selectedTier: Tier;
  onTierChange: (tier: Tier) => void;
}

const TIER_META: Record<Tier, { name: string; badge: string; ring: string; accent: string; description: string }> = {
  budget: {
    name: 'Budget',
    badge: 'bg-green-100 text-green-800',
    ring: 'ring-green-500',
    accent: 'text-green-700',
    description: 'Best value · Hotel under $100/night',
  },
  comfort: {
    name: 'Comfort',
    badge: 'bg-blue-100 text-blue-800',
    ring: 'ring-blue-500',
    accent: 'text-blue-700',
    description: 'Balanced quality · Hotel $100–$250/night',
  },
  luxury: {
    name: 'Luxury',
    badge: 'bg-purple-100 text-purple-800',
    ring: 'ring-purple-500',
    accent: 'text-purple-700',
    description: 'Premium everything · Hotel $300+/night',
  },
};

const ACTIVITY_COLORS: Record<string, string> = {
  temple: 'bg-amber-100 text-amber-800',
  shrine: 'bg-amber-100 text-amber-800',
  museum: 'bg-blue-100 text-blue-800',
  shopping: 'bg-pink-100 text-pink-800',
  park: 'bg-green-100 text-green-800',
  beach: 'bg-cyan-100 text-cyan-800',
  attraction: 'bg-slate-100 text-slate-800',
  meal: 'bg-orange-100 text-orange-800',
  travel: 'bg-slate-50 text-slate-500',
  castle: 'bg-red-100 text-red-800',
  viewpoint: 'bg-indigo-100 text-indigo-800',
  default: 'bg-slate-100 text-slate-700',
};

function fmt(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < Math.round(value) ? 'fill-amber-400' : 'fill-slate-200 text-slate-200'}`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-slate-600">{value.toFixed(1)}</span>
    </span>
  );
}

function HotelCard({ hotel }: { hotel: RankedHotel }) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-slate-900 leading-tight">{hotel.name}</h4>
          <span className="text-lg font-bold text-blue-600 whitespace-nowrap">${hotel.estimatedPrice}<span className="text-xs font-normal text-slate-500">/night</span></span>
        </div>
        <Stars value={hotel.rating} />
        {hotel.lat && hotel.lng && (
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />{hotel.lat.toFixed(4)}, {hotel.lng.toFixed(4)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RestaurantCard({ restaurant }: { restaurant: RankedRestaurant }) {
  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-semibold text-slate-900 leading-tight">{restaurant.name}</h4>
          <span className="text-lg font-bold text-blue-600 whitespace-nowrap">~${restaurant.estimatedPrice}<span className="text-xs font-normal text-slate-500">/person</span></span>
        </div>
        <Stars value={restaurant.rating} />
        <p className="mt-1 text-xs capitalize text-slate-500">{restaurant.cuisine} cuisine</p>
        {restaurant.lat && restaurant.lng && (
          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3" />{restaurant.lat.toFixed(4)}, {restaurant.lng.toFixed(4)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function ItineraryResults({ result, selectedTier, onTierChange }: ItineraryResultsProps) {
  const currentPlan: TripPlan = result.plans[selectedTier];
  const meta = TIER_META[selectedTier];
  const destination = result.extraction.places[0] || 'Your Destination';
  const totalPlaces = currentPlan.schedule.reduce(
    (sum, day) => sum + day.activities.filter((a) => a.type === 'place').length,
    0
  );

  return (
    <section className="w-full border-t border-slate-200 bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-16">

        {/* ── Trip header ── */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Badge className={`${meta.badge} border-0`}>{meta.name} Plan</Badge>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{destination}</h1>
            <p className="max-w-2xl text-lg text-slate-600">{currentPlan.narration.summary}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 md:grid-cols-4">
            {[
              { label: 'Duration', value: `${result.persona.days} days` },
              { label: 'Places', value: String(totalPlaces) },
              { label: 'Hotel from', value: `$${currentPlan.hotel?.estimatedPrice ?? '—'}/night` },
              { label: 'Total Cost', value: `$${currentPlan.cost.totalCost.toLocaleString()}` },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Compare plans ── */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Compare Plans</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(['budget', 'comfort', 'luxury'] as Tier[]).map((tier) => {
              const plan = result.plans[tier];
              const m = TIER_META[tier];
              const isActive = selectedTier === tier;
              const hotel = plan.hotel;
              const topRestaurant = plan.restaurants[0];

              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onTierChange(tier)}
                  className={`rounded-2xl border-2 p-6 text-left transition-all ${
                    isActive
                      ? `border-transparent bg-white shadow-xl ring-2 ${m.ring}`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-widest ${m.accent}`}>{m.name}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">${plan.cost.totalCost.toLocaleString()}</p>
                  <p className="mt-1 text-sm text-slate-500">${plan.cost.perPersonCost.toLocaleString()} per person</p>

                  <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                    {/* Hotel */}
                    <div className="flex items-start gap-2">
                      <BedDouble className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {hotel?.name ?? `${m.name} hotel`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {hotel && <Stars value={hotel.rating} />}
                          <span className="text-xs text-blue-600 font-semibold">
                            ${hotel?.estimatedPrice ?? (tier === 'budget' ? 65 : tier === 'comfort' ? 150 : 350)}/night
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top restaurant */}
                    <div className="flex items-start gap-2">
                      <Utensils className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {topRestaurant?.name ?? `${m.name} dining`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {topRestaurant && <Stars value={topRestaurant.rating} />}
                          <span className="text-xs text-blue-600 font-semibold">
                            ~${topRestaurant?.estimatedPrice ?? (tier === 'budget' ? 10 : tier === 'comfort' ? 30 : 80)}/person
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Day-by-day schedule ── */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Your Itinerary</h2>
          <div className="space-y-10">
            {currentPlan.schedule.map((day) => {
              const narration = currentPlan.narration.dayDescriptions.find((d) => d.day === day.day);
              return (
                <div key={day.day} className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-blue-600 text-white border-0">Day {day.day}</Badge>
                    {narration && <p className="text-sm italic text-slate-600">{narration.description}</p>}
                  </div>

                  <div className="relative space-y-3 pl-8">
                    {day.activities.map((activity, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -left-8 top-3 h-4 w-4 rounded-full border-2 border-white shadow ${
                          activity.type === 'travel' ? 'bg-slate-300' :
                          activity.type === 'meal'   ? 'bg-orange-400' : 'bg-blue-600'
                        }`} />

                        {activity.type === 'travel' ? (
                          <div className="flex items-center gap-2 py-1.5 text-sm italic text-slate-400">
                            <span className="font-mono font-medium">{activity.time}</span>
                            <span>{activity.name}</span>
                            <span className="text-xs">({fmt(activity.duration)})</span>
                          </div>
                        ) : (
                          <Card className="border border-slate-200 transition-shadow hover:shadow-md">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-base font-bold text-blue-600">{activity.time}</span>
                                  <Badge variant="secondary" className={`text-xs capitalize ${ACTIVITY_COLORS[activity.category] || ACTIVITY_COLORS.default}`}>
                                    {activity.category}
                                  </Badge>
                                </div>
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="h-3 w-3" />{fmt(activity.duration)}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-900">{activity.name}</p>
                              {activity.lat && activity.lng && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                  <MapPin className="h-3 w-3" />
                                  {activity.lat.toFixed(4)}, {activity.lng.toFixed(4)}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {idx < day.activities.length - 1 && activity.type !== 'travel' && (
                          <div className="absolute -left-[13px] top-10 h-8 w-px bg-slate-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Where to stay & eat ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

          {/* Where You'll Stay */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">Where You&apos;ll Stay</h3>
            </div>
            <p className="text-sm text-slate-500">{meta.name} accommodation near your itinerary locations</p>
            <div className="space-y-3">
              {currentPlan.hotel ? (
                <HotelCard hotel={currentPlan.hotel} />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 italic">
                  No accommodation data found for this destination.
                </p>
              )}
              {/* Also show next tier hotel as alternative */}
              {(() => {
                const alt: Tier = selectedTier === 'budget' ? 'comfort' : selectedTier === 'luxury' ? 'comfort' : 'luxury';
                const altHotel = result.plans[alt].hotel;
                if (!altHotel || altHotel.name === currentPlan.hotel?.name) return null;
                return (
                  <div>
                    <p className="mb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">Alternative – {TIER_META[alt].name}</p>
                    <HotelCard hotel={altHotel} />
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Where You'll Eat */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-orange-500" />
              <h3 className="text-xl font-bold text-slate-900">Where You&apos;ll Eat</h3>
            </div>
            <p className="text-sm text-slate-500">{meta.name} dining options near your stops</p>
            <div className="space-y-3">
              {currentPlan.restaurants.length > 0 ? (
                currentPlan.restaurants.map((r, i) => <RestaurantCard key={i} restaurant={r} />)
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 italic">
                  No restaurant data found for this destination.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
