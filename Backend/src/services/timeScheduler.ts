import { ResolvedPlace } from './locationEnrichment';

export interface ScheduledActivity {
  time: string;
  name: string;
  category: string;
  duration: number; // minutes
  lat?: number;
  lng?: number;
  type: 'place' | 'meal' | 'travel';
}

export interface DaySchedule {
  day: number;
  date?: string;
  activities: ScheduledActivity[];
  totalDuration: number;
}

// Duration estimates per category (minutes)
const CATEGORY_DURATIONS: Record<string, number> = {
  temple: 90,
  shrine: 60,
  church: 45,
  mosque: 45,
  museum: 120,
  shopping: 120,
  mall: 120,
  market: 90,
  park: 60,
  garden: 60,
  beach: 120,
  attraction: 75,
  monument: 45,
  castle: 90,
  viewpoint: 30,
  restaurant: 60,
  cafe: 45,
  bar: 60,
  default: 75,
};

function inferCategory(place: ResolvedPlace): string {
  const nameLower = place.name.toLowerCase();
  if (nameLower.includes('temple') || nameLower.includes('sensoji') || nameLower.includes('ji')) return 'temple';
  if (nameLower.includes('shrine') || nameLower.includes('jinja')) return 'shrine';
  if (nameLower.includes('museum')) return 'museum';
  if (nameLower.includes('market') || nameLower.includes('tsukiji')) return 'market';
  if (nameLower.includes('mall') || nameLower.includes('shopping') || nameLower.includes('plaza')) return 'shopping';
  if (nameLower.includes('park') || nameLower.includes('garden') || nameLower.includes('yoyogi')) return 'park';
  if (nameLower.includes('beach') || nameLower.includes('bay')) return 'beach';
  if (nameLower.includes('castle') || nameLower.includes('palace')) return 'castle';
  if (nameLower.includes('tower') || nameLower.includes('skytree')) return 'viewpoint';
  return 'attraction';
}

function dayCentroid(places: ResolvedPlace[]): { lat: number; lng: number } | null {
  if (places.length === 0) return null;
  return {
    lat: places.reduce((s, p) => s + p.lat, 0) / places.length,
    lng: places.reduce((s, p) => s + p.lng, 0) / places.length,
  };
}

function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const h = hours % 24;
  return `${h.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Simplified travel time using Haversine (~4 km/h walking, or ~30 km/h transit)
function estimateTravelMinutes(from: ResolvedPlace, to: ResolvedPlace): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Under 1km: walk (4 km/h), over: transit (25 km/h)
  if (distanceKm < 1) return Math.ceil((distanceKm / 4) * 60);
  return Math.ceil((distanceKm / 25) * 60) + 10; // +10 min waiting
}

export function scheduleDayPlaces(day: number, places: ResolvedPlace[]): DaySchedule {
  const activities: ScheduledActivity[] = [];
  let currentMinutes = 9 * 60; // Start at 9:00 AM

  const LUNCH_WINDOW_START = 13 * 60;
  const DINNER_WINDOW_START = 19 * 60;
  let lunchAdded = false;
  let dinnerAdded = false;

  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const category = inferCategory(place);
    const duration = CATEGORY_DURATIONS[category] || CATEGORY_DURATIONS.default;

    // Insert lunch between places
    if (!lunchAdded && currentMinutes >= LUNCH_WINDOW_START) {
      const centroid = dayCentroid(places);
      activities.push({
        time: minutesToTimeString(currentMinutes),
        name: 'Lunch',
        category: 'meal',
        duration: 60,
        lat: centroid?.lat,
        lng: centroid?.lng,
        type: 'meal',
      });
      currentMinutes += 60;
      lunchAdded = true;
    }

    // Insert dinner
    if (!dinnerAdded && currentMinutes >= DINNER_WINDOW_START) {
      const centroid = dayCentroid(places);
      activities.push({
        time: minutesToTimeString(currentMinutes),
        name: 'Dinner',
        category: 'meal',
        duration: 75,
        lat: centroid?.lat,
        lng: centroid?.lng,
        type: 'meal',
      });
      currentMinutes += 75;
      dinnerAdded = true;
    }

    activities.push({
      time: minutesToTimeString(currentMinutes),
      name: place.name,
      category,
      duration,
      lat: place.lat,
      lng: place.lng,
      type: 'place',
    });
    currentMinutes += duration;

    // Travel time to next place
    if (i < places.length - 1) {
      const travelMins = estimateTravelMinutes(place, places[i + 1]);
      if (travelMins > 5) {
        activities.push({
          time: minutesToTimeString(currentMinutes),
          name: `Transit to ${places[i + 1].name}`,
          category: 'travel',
          duration: travelMins,
          lat: places[i + 1].lat,
          lng: places[i + 1].lng,
          type: 'travel',
        });
        currentMinutes += travelMins;
      }
    }
  }

  // Always add dinner if not yet added
  if (!dinnerAdded && activities.length > 0) {
    const centroid = dayCentroid(places);
    activities.push({
      time: minutesToTimeString(currentMinutes),
      name: 'Dinner',
      category: 'meal',
      duration: 75,
      lat: centroid?.lat,
      lng: centroid?.lng,
      type: 'meal',
    });
    currentMinutes += 75;
  }

  return {
    day,
    activities,
    totalDuration: currentMinutes - 9 * 60,
  };
}
