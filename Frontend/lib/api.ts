// Uses same-origin /api proxy (see next.config.mjs) unless NEXT_PUBLIC_API_URL is set
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

async function apiRequest(path: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(
      'Cannot connect to backend. Start it with: cd Backend && npm run dev'
    );
  }
}

export interface ExtractionData {
  tripId: string;
  places: string[];
  activities: string[];
  vibes: string[];
}

export interface PersonaInput {
  travelStyle: string;
  groupType: string;
  pace: string;
  days: number;
}

export interface ScheduledActivity {
  time: string;
  name: string;
  category: string;
  duration: number;
  lat?: number;
  lng?: number;
  type: 'place' | 'meal' | 'travel';
}

export interface DaySchedule {
  day: number;
  activities: ScheduledActivity[];
  totalDuration: number;
}

export interface RankedHotel {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  estimatedPrice: number;
  score: number;
  tier: string;
}

export interface RankedRestaurant {
  name: string;
  lat: number;
  lng: number;
  rating: number;
  estimatedPrice: number;
  cuisine: string;
  score: number;
  tier: string;
}

export interface CostBreakdown {
  hotelCost: number;
  foodCost: number;
  activityCost: number;
  transportCost: number;
  totalCost: number;
  perPersonCost: number;
  currency: string;
}

export interface NarrationOutput {
  summary: string;
  dayDescriptions: { day: number; description: string }[];
}

export interface TripPlan {
  tier: 'budget' | 'comfort' | 'luxury';
  hotel: RankedHotel | null;
  restaurants: RankedRestaurant[];
  schedule: DaySchedule[];
  cost: CostBreakdown;
  narration: NarrationOutput;
}

export interface Tour {
  name: string;
  description: string;
  duration: string;
  estimatedCost: number;
  category: string;
  persona: string[];
}

export interface FullTripResult {
  extraction: ExtractionData & { transcript: string };
  persona: PersonaInput;
  plans: {
    budget: TripPlan;
    comfort: TripPlan;
    luxury: TripPlan;
  };
  tours: Tour[];
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    // Try JSON first, then raw text so we always surface the real message
    const text = await res.text().catch(() => '');
    let message = `Server error ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || message;
    } catch {
      if (text.length > 0 && text.length < 400) message = text;
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function analyzeUrl(url: string): Promise<ExtractionData> {
  const res = await apiRequest('/api/trips/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = await handleResponse<{ tripId: string; data: Omit<ExtractionData, 'tripId'> }>(res);
  return { tripId: data.tripId, ...data.data };
}

export async function planTrip(
  url: string,
  persona: PersonaInput,
  tripId?: string,
  extraction?: Pick<ExtractionData, 'places' | 'activities' | 'vibes'>
): Promise<{ tripId: string; data: FullTripResult }> {
  const res = await apiRequest('/api/trips/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, persona, tripId, extraction }),
  });

  const data = await handleResponse<{ tripId: string; data: FullTripResult }>(res);
  return { tripId: data.tripId, data: data.data };
}
