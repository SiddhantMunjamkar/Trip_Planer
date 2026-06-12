export function formatCoordinates(lat?: number, lng?: number): string {
  if (lat == null || lng == null) return 'Coordinates unavailable';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}°${latDir}, ${Math.abs(lng).toFixed(5)}°${lngDir}`;
}

export function formatCoordinatesCompact(lat?: number, lng?: number): string {
  if (lat == null || lng == null) return '—';
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
