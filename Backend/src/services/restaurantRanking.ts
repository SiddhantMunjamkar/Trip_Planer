import { NearbyItem } from './locationEnrichment';

export interface RankedRestaurant {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  estimatedPrice: number;
  cuisine: string;
  score: number;
  tier: 'budget' | 'comfort' | 'luxury';
}

type TravelStyle = 'foodie' | 'culture' | 'adventure' | 'relaxed' | 'party';

interface PersonaWeights {
  ratingWeight: number;
  priceWeight: number;
  distanceWeight: number;
}

function getPersonaWeights(travelStyle: TravelStyle): PersonaWeights {
  switch (travelStyle) {
    case 'foodie':
      return { ratingWeight: 0.6, priceWeight: 0.2, distanceWeight: 0.2 };
    case 'adventure':
      return { ratingWeight: 0.3, priceWeight: 0.4, distanceWeight: 0.3 };
    case 'culture':
      return { ratingWeight: 0.5, priceWeight: 0.3, distanceWeight: 0.2 };
    default:
      return { ratingWeight: 0.4, priceWeight: 0.4, distanceWeight: 0.2 };
  }
}

function estimateRestaurantPrice(tags: Record<string, string>): number {
  const priceTag = tags['price'] || tags['fee'];
  if (priceTag === 'free') return 5;
  if (priceTag === '$') return 10;
  if (priceTag === '$$') return 25;
  if (priceTag === '$$$') return 50;
  if (priceTag === '$$$$') return 100;

  const cuisine = (tags['cuisine'] || '').toLowerCase();
  if (cuisine.includes('fast_food') || cuisine.includes('pizza')) return 12;
  if (cuisine.includes('sushi') || cuisine.includes('steak')) return 60;
  return 25;
}

function estimateRestaurantRating(tags: Record<string, string>): number {
  return 3.2 + Math.random() * 1.5;
}

function extractCuisine(tags: Record<string, string>): string {
  return tags['cuisine'] || tags['food'] || 'local';
}

function scoreRestaurant(
  restaurant: NearbyItem,
  weights: PersonaWeights,
  targetPrice: number,
  centerLat: number,
  centerLng: number
): number {
  const rating = estimateRestaurantRating(restaurant.tags);
  const price = estimateRestaurantPrice(restaurant.tags);

  const dLat = (restaurant.lat - centerLat) * (Math.PI / 180);
  const dLng = (restaurant.lng - centerLng) * (Math.PI / 180);
  const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111;
  const distanceScore = Math.max(0, 1 - distanceKm / 2);

  const priceDiff = Math.abs(price - targetPrice);
  const priceScore = Math.max(0, 1 - priceDiff / targetPrice);
  const ratingScore = (rating - 1) / 4;

  return (
    ratingScore * weights.ratingWeight +
    priceScore * weights.priceWeight +
    distanceScore * weights.distanceWeight
  );
}

const TIER_TARGET_PRICES = { budget: 12, comfort: 30, luxury: 80 };

export function rankRestaurants(
  restaurants: NearbyItem[],
  centerLat: number,
  centerLng: number,
  travelStyle: TravelStyle = 'relaxed'
): { budget: RankedRestaurant[]; comfort: RankedRestaurant[]; luxury: RankedRestaurant[] } {
  const weights = getPersonaWeights(travelStyle);
  const tiers: ('budget' | 'comfort' | 'luxury')[] = ['budget', 'comfort', 'luxury'];
  const result = {} as { budget: RankedRestaurant[]; comfort: RankedRestaurant[]; luxury: RankedRestaurant[] };

  for (const tier of tiers) {
    result[tier] = restaurants
      .map((r) => ({
        name: r.name,
        lat: r.lat,
        lng: r.lng,
        rating: parseFloat(estimateRestaurantRating(r.tags).toFixed(1)),
        estimatedPrice: estimateRestaurantPrice(r.tags),
        cuisine: extractCuisine(r.tags),
        score: scoreRestaurant(r, weights, TIER_TARGET_PRICES[tier], centerLat, centerLng),
        tier,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  return result;
}
