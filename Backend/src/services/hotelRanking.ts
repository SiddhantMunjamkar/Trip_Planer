import { NearbyItem } from './locationEnrichment';

export interface RankedHotel {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  estimatedPrice: number;
  score: number;
  tier: 'budget' | 'comfort' | 'luxury';
  tags: Record<string, string>;
}

interface ScoringConfig {
  ratingWeight: number;
  budgetMatchWeight: number;
  distanceWeight: number;
  targetPrice: number;
  maxPrice: number;
}

const TIER_CONFIGS: Record<'budget' | 'comfort' | 'luxury', ScoringConfig> = {
  budget: {
    ratingWeight: 0.3,
    budgetMatchWeight: 0.5,
    distanceWeight: 0.2,
    targetPrice: 60,
    maxPrice: 100,
  },
  comfort: {
    ratingWeight: 0.5,
    budgetMatchWeight: 0.3,
    distanceWeight: 0.2,
    targetPrice: 150,
    maxPrice: 250,
  },
  luxury: {
    ratingWeight: 0.7,
    budgetMatchWeight: 0.1,
    distanceWeight: 0.2,
    targetPrice: 350,
    maxPrice: 9999,
  },
};

function estimateHotelPrice(tags: Record<string, string>): number {
  const stars = parseInt(tags['stars'] || tags['star_rating'] || '0');
  if (stars >= 5) return 400;
  if (stars === 4) return 200;
  if (stars === 3) return 120;
  if (stars === 2) return 80;
  if (stars === 1) return 50;

  // Fallback: use name heuristics
  const name = (tags.name || '').toLowerCase();
  if (name.includes('luxury') || name.includes('grand') || name.includes('palace') || name.includes('ritz')) return 350;
  if (name.includes('inn') || name.includes('hostel') || name.includes('budget') || name.includes('lodge')) return 60;
  return 130;
}

function estimateRating(tags: Record<string, string>): number {
  const stars = parseInt(tags['stars'] || tags['star_rating'] || '0');
  if (stars >= 5) return 4.8;
  if (stars === 4) return 4.3;
  if (stars === 3) return 3.8;
  if (stars <= 2 && stars > 0) return 3.2;
  return 3.5 + Math.random() * 0.8; // randomize slightly for variety
}

function scoreHotel(hotel: NearbyItem, config: ScoringConfig, centerLat: number, centerLng: number): number {
  const rating = estimateRating(hotel.tags);
  const price = estimateHotelPrice(hotel.tags);

  // Distance from cluster center (Haversine simplified)
  const dLat = (hotel.lat - centerLat) * (Math.PI / 180);
  const dLng = (hotel.lng - centerLng) * (Math.PI / 180);
  const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
  const distanceScore = Math.max(0, 1 - distanceKm / 5);

  // Budget match: closer to target price = higher score
  const priceDiff = Math.abs(price - config.targetPrice);
  const budgetMatchScore = Math.max(0, 1 - priceDiff / config.targetPrice);

  // Normalize rating to 0-1
  const ratingScore = (rating - 1) / 4;

  return (
    ratingScore * config.ratingWeight +
    budgetMatchScore * config.budgetMatchWeight +
    distanceScore * config.distanceWeight
  );
}

export function rankHotels(
  hotels: NearbyItem[],
  centerLat: number,
  centerLng: number
): { budget: RankedHotel[]; comfort: RankedHotel[]; luxury: RankedHotel[] } {
  const tiers: ('budget' | 'comfort' | 'luxury')[] = ['budget', 'comfort', 'luxury'];
  const result = {} as { budget: RankedHotel[]; comfort: RankedHotel[]; luxury: RankedHotel[] };

  for (const tier of tiers) {
    const config = TIER_CONFIGS[tier];
    result[tier] = hotels
      .map((h) => ({
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        rating: parseFloat(estimateRating(h.tags).toFixed(1)),
        estimatedPrice: estimateHotelPrice(h.tags),
        score: scoreHotel(h, config, centerLat, centerLng),
        tier,
        tags: h.tags,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  return result;
}
