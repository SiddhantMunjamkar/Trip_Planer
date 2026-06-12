import { ExtractionResult } from './contentAnalyzer';
import { resolveAndEnrichPlaces, resolvePlaceCoordinates, EnrichedPlace, ResolvedPlace } from './locationEnrichment';
import { rankHotels, RankedHotel } from './hotelRanking';
import { rankRestaurants, RankedRestaurant } from './restaurantRanking';
import { clusterPlacesByDay, Cluster } from './placeClustering';
import { scheduleDayPlaces, DaySchedule } from './timeScheduler';
import { calculateCost, CostBreakdown } from './costEngine';
import { getRecommendedTours, Tour } from './tourRecommendation';
import { buildTemplateNarration, NarrationOutput } from './llmNarration';

// Fallback hotel data per tier when Overpass returns nothing
function syntheticHotels(
  destination: string,
  centerLat: number,
  centerLng: number
): { budget: RankedHotel[]; comfort: RankedHotel[]; luxury: RankedHotel[] } {
  const base = { lat: centerLat, lng: centerLng, score: 0.8, tags: {} };
  return {
    budget: [
      { ...base, name: `${destination} Budget Inn`, rating: 3.2, estimatedPrice: 65, tier: 'budget' },
      { ...base, name: `${destination} Hostel`, rating: 3.5, estimatedPrice: 45, tier: 'budget' },
    ],
    comfort: [
      { ...base, name: `${destination} City Hotel`, rating: 4.0, estimatedPrice: 140, tier: 'comfort' },
      { ...base, name: `${destination} Business Hotel`, rating: 4.2, estimatedPrice: 180, tier: 'comfort' },
    ],
    luxury: [
      { ...base, name: `Grand ${destination} Hotel`, rating: 4.7, estimatedPrice: 320, tier: 'luxury' },
      { ...base, name: `${destination} Palace Hotel`, rating: 4.9, estimatedPrice: 450, tier: 'luxury' },
    ],
  };
}

// Fallback restaurant data per tier when Overpass returns nothing
function syntheticRestaurants(
  destination: string,
  centerLat: number,
  centerLng: number
): { budget: RankedRestaurant[]; comfort: RankedRestaurant[]; luxury: RankedRestaurant[] } {
  const base = { lat: centerLat, lng: centerLng, score: 0.8 };
  return {
    budget: [
      { ...base, name: `${destination} Street Kitchen`, rating: 3.8, estimatedPrice: 10, cuisine: 'local', tier: 'budget' },
      { ...base, name: `Local Food Court`, rating: 3.5, estimatedPrice: 8, cuisine: 'mixed', tier: 'budget' },
      { ...base, name: `${destination} Café`, rating: 3.6, estimatedPrice: 12, cuisine: 'cafe', tier: 'budget' },
    ],
    comfort: [
      { ...base, name: `${destination} Bistro`, rating: 4.1, estimatedPrice: 28, cuisine: 'international', tier: 'comfort' },
      { ...base, name: `City Grill ${destination}`, rating: 4.2, estimatedPrice: 35, cuisine: 'grill', tier: 'comfort' },
      { ...base, name: `${destination} Garden Restaurant`, rating: 4.0, estimatedPrice: 30, cuisine: 'local', tier: 'comfort' },
    ],
    luxury: [
      { ...base, name: `Le ${destination} Restaurant`, rating: 4.7, estimatedPrice: 85, cuisine: 'fine dining', tier: 'luxury' },
      { ...base, name: `${destination} Rooftop Dining`, rating: 4.8, estimatedPrice: 95, cuisine: 'international', tier: 'luxury' },
      { ...base, name: `Chef's Table ${destination}`, rating: 4.9, estimatedPrice: 110, cuisine: 'gourmet', tier: 'luxury' },
    ],
  };
}

export interface PersonaInput {
  travelStyle: string;
  groupType: string;
  pace: string;
  days: number;
}

export interface TripPlan {
  tier: 'budget' | 'comfort' | 'luxury';
  hotel: RankedHotel | null;
  restaurants: RankedRestaurant[];
  schedule: DaySchedule[];
  cost: CostBreakdown;
  narration: NarrationOutput;
}

export interface FullTripResult {
  extraction: ExtractionResult;
  persona: PersonaInput;
  enrichedPlaces: EnrichedPlace[];
  clusters: Cluster[];
  plans: {
    budget: TripPlan;
    comfort: TripPlan;
    luxury: TripPlan;
  };
  tours: Tour[];
}

function getTotalDistanceKm(clusters: Cluster[]): number {
  let total = 0;
  clusters.forEach((cluster) => {
    for (let i = 0; i < cluster.places.length - 1; i++) {
      const a = cluster.places[i];
      const b = cluster.places[i + 1];
      const dLat = ((b.lat - a.lat) * Math.PI) / 180;
      const dLng = ((b.lng - a.lng) * Math.PI) / 180;
      const chord =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
      total += 6371 * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
    }
  });
  return total;
}

function buildPlan(
  tier: 'budget' | 'comfort' | 'luxury',
  clusters: Cluster[],
  enrichedPlaces: EnrichedPlace[],
  persona: PersonaInput
): Omit<TripPlan, 'narration'> {
  // Aggregate all hotels and restaurants from enriched places
  const allHotels = enrichedPlaces.flatMap((ep) => ep.hotels);
  const allRestaurants = enrichedPlaces.flatMap((ep) => ep.restaurants);

  // Use the overall centroid of all resolved places for ranking center
  const allResolved = clusters.flatMap((c) => c.places);
  const centerLat = allResolved.reduce((s, p) => s + p.lat, 0) / (allResolved.length || 1);
  const centerLng = allResolved.reduce((s, p) => s + p.lng, 0) / (allResolved.length || 1);

  const destination = clusters[0]?.places[0]?.name || 'Destination';

  const rankedHotels = allHotels.length > 0
    ? rankHotels(allHotels, centerLat, centerLng)
    : syntheticHotels(destination, centerLat, centerLng);

  const rankedRestaurants = allRestaurants.length > 0
    ? rankRestaurants(allRestaurants, centerLat, centerLng, persona.travelStyle as any)
    : syntheticRestaurants(destination, centerLat, centerLng);

  const topHotel = rankedHotels[tier][0] || null;
  const topRestaurants = rankedRestaurants[tier];

  // Build day schedules from clusters
  const schedule: DaySchedule[] = clusters.map((cluster) =>
    scheduleDayPlaces(cluster.day, cluster.places)
  );

  const totalDistanceKm = getTotalDistanceKm(clusters);
  const totalActivities = allResolved.length;
  const hotelPrice = topHotel?.estimatedPrice || (tier === 'budget' ? 70 : tier === 'comfort' ? 150 : 350);

  const cost = calculateCost(
    tier,
    hotelPrice,
    persona.days,
    totalDistanceKm,
    totalActivities,
    persona.groupType as any
  );

  return { tier, hotel: topHotel, restaurants: topRestaurants, schedule, cost };
}

async function resolvePlacesWithFallback(placeNames: string[]): Promise<{
  enrichedPlaces: EnrichedPlace[];
  resolvedPlaces: ResolvedPlace[];
}> {
  const names = placeNames.slice(0, 10);
  let enrichedPlaces = await resolveAndEnrichPlaces(names);
  let resolvedPlaces = enrichedPlaces.map((ep) => ep.place);

  if (resolvedPlaces.length === 0 && names.length > 0) {
    const anchor = (await resolvePlaceCoordinates(names[0])) ?? {
      name: names[0],
      lat: 40.7128,
      lng: -74.006,
      displayName: names[0],
    };

    resolvedPlaces = names.map((name) => ({
      name,
      lat: anchor.lat,
      lng: anchor.lng,
      displayName: name,
    }));

    enrichedPlaces = resolvedPlaces.map((place) => ({
      place,
      hotels: [],
      restaurants: [],
      attractions: [],
    }));
  }

  return { enrichedPlaces, resolvedPlaces };
}

function ensureClusters(
  clusters: Cluster[],
  resolvedPlaces: ResolvedPlace[],
  days: number
): Cluster[] {
  if (clusters.length > 0) return clusters;

  const anchor = resolvedPlaces[0] ?? {
    name: 'City Center',
    lat: 40.7128,
    lng: -74.006,
    displayName: 'City Center',
  };

  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    places: resolvedPlaces.length > 0 ? [resolvedPlaces[i % resolvedPlaces.length]] : [anchor],
    centroid: { lat: anchor.lat, lng: anchor.lng },
  }));
}

export async function planTrip(
  extraction: ExtractionResult,
  persona: PersonaInput
): Promise<FullTripResult> {
  const { enrichedPlaces, resolvedPlaces } = await resolvePlacesWithFallback(extraction.places);

  let clusters = clusterPlacesByDay(resolvedPlaces, persona.days);
  clusters = ensureClusters(clusters, resolvedPlaces, persona.days);

  const tiers: ('budget' | 'comfort' | 'luxury')[] = ['budget', 'comfort', 'luxury'];
  const tierPlans: Record<string, Omit<TripPlan, 'narration'>> = {};

  for (const tier of tiers) {
    tierPlans[tier] = buildPlan(tier, clusters, enrichedPlaces, persona);
  }

  const destination = extraction.places[0] || 'your destination';

  const plans = {
    budget: {
      ...tierPlans.budget,
      narration: buildTemplateNarration({
        tier: 'budget',
        destination,
        days: persona.days,
        schedule: tierPlans.budget.schedule,
        topHotel: tierPlans.budget.hotel,
        topRestaurants: tierPlans.budget.restaurants,
        vibes: extraction.vibes,
        activities: extraction.activities,
      }),
    } as TripPlan,
    comfort: {
      ...tierPlans.comfort,
      narration: buildTemplateNarration({
        tier: 'comfort',
        destination,
        days: persona.days,
        schedule: tierPlans.comfort.schedule,
        topHotel: tierPlans.comfort.hotel,
        topRestaurants: tierPlans.comfort.restaurants,
        vibes: extraction.vibes,
        activities: extraction.activities,
      }),
    } as TripPlan,
    luxury: {
      ...tierPlans.luxury,
      narration: buildTemplateNarration({
        tier: 'luxury',
        destination,
        days: persona.days,
        schedule: tierPlans.luxury.schedule,
        topHotel: tierPlans.luxury.hotel,
        topRestaurants: tierPlans.luxury.restaurants,
        vibes: extraction.vibes,
        activities: extraction.activities,
      }),
    } as TripPlan,
  };

  const tours = getRecommendedTours(persona.travelStyle, extraction.vibes);

  return { extraction, persona, enrichedPlaces, clusters, plans, tours };
}
