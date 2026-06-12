import axios from 'axios';

export interface ResolvedPlace {
  name: string;
  lat: number;
  lng: number;
  displayName: string;
}

export interface NearbyItem {
  id: number;
  name: string;
  lat: number;
  lng: number;
  tags: Record<string, string>;
}

export interface EnrichedPlace {
  place: ResolvedPlace;
  hotels: NearbyItem[];
  restaurants: NearbyItem[];
  attractions: NearbyItem[];
}

// --- Place Resolver via Nominatim ---
export async function resolvePlaceCoordinates(name: string): Promise<ResolvedPlace | null> {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: name,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: { 'User-Agent': 'Backend/1.0 (travel-app@localhost)' },
      timeout: 8000,
    });

    if (!response.data || response.data.length === 0) return null;

    const result = response.data[0];
    return {
      name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch {
    return null;
  }
}

// --- Nearby Discovery via Overpass ---
async function queryOverpass(lat: number, lng: number, amenityType: string, radiusMeters: number): Promise<NearbyItem[]> {
  const query = `
    [out:json][timeout:20];
    node["amenity"="${amenityType}"](around:${radiusMeters},${lat},${lng});
    out body 15;
  `;

  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      }
    );

    return (response.data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        tags: el.tags,
      }));
  } catch {
    return [];
  }
}

// Hotels in OSM use tourism=hotel, not amenity=hotel
async function queryOverpassHotels(lat: number, lng: number, radiusMeters: number): Promise<NearbyItem[]> {
  const query = `
    [out:json][timeout:20];
    (
      node["tourism"="hotel"](around:${radiusMeters},${lat},${lng});
      node["tourism"="guest_house"](around:${radiusMeters},${lat},${lng});
      node["tourism"="hostel"](around:${radiusMeters},${lat},${lng});
      node["tourism"="motel"](around:${radiusMeters},${lat},${lng});
    );
    out body 15;
  `;

  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      }
    );

    return (response.data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        tags: el.tags,
      }));
  } catch {
    return [];
  }
}

async function queryOverpassTourism(lat: number, lng: number, radiusMeters: number): Promise<NearbyItem[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["tourism"~"attraction|museum|viewpoint|artwork"](around:${radiusMeters},${lat},${lng});
      node["historic"~"monument|ruins|castle|memorial"](around:${radiusMeters},${lat},${lng});
    );
    out body 10;
  `;

  try {
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      }
    );

    return (response.data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
        tags: el.tags,
      }));
  } catch {
    return [];
  }
}

export async function enrichPlace(resolved: ResolvedPlace): Promise<EnrichedPlace> {
  const [hotels, restaurants, attractions] = await Promise.all([
    queryOverpassHotels(resolved.lat, resolved.lng, 5000),
    queryOverpass(resolved.lat, resolved.lng, 'restaurant', 2000),
    queryOverpassTourism(resolved.lat, resolved.lng, 2000),
  ]);

  return { place: resolved, hotels, restaurants, attractions };
}

export async function resolveAndEnrichPlaces(placeNames: string[]): Promise<EnrichedPlace[]> {
  const names = placeNames.slice(0, 5);
  const resolvedPlaces: ResolvedPlace[] = [];

  // Geocode sequentially (Nominatim rate limit: 1 req/sec)
  for (const name of names) {
    const resolved = await resolvePlaceCoordinates(name);
    if (resolved) resolvedPlaces.push(resolved);
    await new Promise((r) => setTimeout(r, 1100));
  }

  if (resolvedPlaces.length === 0) return [];

  // Single Overpass batch at trip center — much faster than per-place queries
  const centerLat = resolvedPlaces.reduce((s, p) => s + p.lat, 0) / resolvedPlaces.length;
  const centerLng = resolvedPlaces.reduce((s, p) => s + p.lng, 0) / resolvedPlaces.length;

  const [hotels, restaurants, attractions] = await Promise.all([
    queryOverpassHotels(centerLat, centerLng, 5000),
    queryOverpass(centerLat, centerLng, 'restaurant', 2000),
    queryOverpassTourism(centerLat, centerLng, 2000),
  ]);

  return resolvedPlaces.map((place) => ({
    place,
    hotels,
    restaurants,
    attractions,
  }));
}
