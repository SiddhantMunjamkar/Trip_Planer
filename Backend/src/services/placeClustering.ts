import { ResolvedPlace } from './locationEnrichment';

export interface Cluster {
  day: number;
  places: ResolvedPlace[];
  centroid: { lat: number; lng: number };
}

function haversineDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const chord =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

function computeCentroid(places: ResolvedPlace[]): { lat: number; lng: number } {
  const lat = places.reduce((s, p) => s + p.lat, 0) / places.length;
  const lng = places.reduce((s, p) => s + p.lng, 0) / places.length;
  return { lat, lng };
}

function initializeCentroids(places: ResolvedPlace[], k: number): { lat: number; lng: number }[] {
  // K-Means++ initialization for better convergence
  const centroids: { lat: number; lng: number }[] = [];
  centroids.push({ lat: places[0].lat, lng: places[0].lng });

  for (let i = 1; i < k; i++) {
    const distances = places.map((p) =>
      Math.min(...centroids.map((c) => haversineDistance(p, c)))
    );
    const totalDist = distances.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalDist;
    for (let j = 0; j < places.length; j++) {
      rand -= distances[j];
      if (rand <= 0) {
        centroids.push({ lat: places[j].lat, lng: places[j].lng });
        break;
      }
    }
    if (centroids.length < i + 1) {
      centroids.push({ lat: places[places.length - 1].lat, lng: places[places.length - 1].lng });
    }
  }

  return centroids;
}

export function clusterPlacesByDay(places: ResolvedPlace[], numberOfDays: number): Cluster[] {
  if (places.length === 0) return [];

  const k = Math.min(numberOfDays, places.length);

  if (places.length <= k) {
    // Fewer places than days: each place gets its own day
    return places.map((p, i) => ({
      day: i + 1,
      places: [p],
      centroid: { lat: p.lat, lng: p.lng },
    }));
  }

  let centroids = initializeCentroids(places, k);
  let assignments: number[] = new Array(places.length).fill(0);
  const maxIterations = 50;

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assignment step
    const newAssignments = places.map((p) => {
      let minDist = Infinity;
      let closest = 0;
      centroids.forEach((c, i) => {
        const d = haversineDistance(p, c);
        if (d < minDist) {
          minDist = d;
          closest = i;
        }
      });
      return closest;
    });

    // Check convergence
    if (newAssignments.every((a, i) => a === assignments[i])) break;
    assignments = newAssignments;

    // Update step
    const newCentroids: { lat: number; lng: number }[] = [];
    for (let c = 0; c < k; c++) {
      const clusterPlaces = places.filter((_, i) => assignments[i] === c);
      if (clusterPlaces.length > 0) {
        newCentroids.push(computeCentroid(clusterPlaces));
      } else {
        newCentroids.push(centroids[c]);
      }
    }
    centroids = newCentroids;
  }

  // Build clusters
  const clusters: Cluster[] = [];
  for (let c = 0; c < k; c++) {
    const clusterPlaces = places.filter((_, i) => assignments[i] === c);
    if (clusterPlaces.length > 0) {
      clusters.push({
        day: c + 1,
        places: clusterPlaces,
        centroid: computeCentroid(clusterPlaces),
      });
    }
  }

  // Ensure all days are accounted for (fill empty clusters from largest)
  while (clusters.length < numberOfDays) {
    const largest = clusters.sort((a, b) => b.places.length - a.places.length)[0];
    if (largest.places.length <= 1) break;
    const moved = largest.places.splice(-1, 1)[0];
    clusters.push({
      day: clusters.length + 1,
      places: [moved],
      centroid: { lat: moved.lat, lng: moved.lng },
    });
    largest.centroid = computeCentroid(largest.places);
  }

  return clusters.sort((a, b) => a.day - b.day);
}
