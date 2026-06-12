export interface Tour {
  name: string;
  description: string;
  duration: string;
  estimatedCost: number;
  category: string;
  persona: string[];
}

const TOUR_CATALOG: Tour[] = [
  {
    name: 'Street Food Crawl',
    description: 'Guided tour of the best local street food stalls and night markets.',
    duration: '3 hours',
    estimatedCost: 35,
    category: 'food',
    persona: ['foodie', 'culture'],
  },
  {
    name: 'Cooking Class',
    description: 'Learn to cook authentic local dishes with a professional chef.',
    duration: '4 hours',
    estimatedCost: 80,
    category: 'food',
    persona: ['foodie'],
  },
  {
    name: 'Temple & Shrine Tour',
    description: 'Guided historical tour of the most sacred temples and shrines.',
    duration: '5 hours',
    estimatedCost: 40,
    category: 'culture',
    persona: ['culture', 'relaxed'],
  },
  {
    name: 'Museum Hopper Pass',
    description: 'All-day access to the top 3 museums in the city.',
    duration: 'Full day',
    estimatedCost: 55,
    category: 'culture',
    persona: ['culture'],
  },
  {
    name: 'Night Life Tour',
    description: 'Curated nightlife experience including bars, clubs, and rooftop spots.',
    duration: '4 hours',
    estimatedCost: 60,
    category: 'nightlife',
    persona: ['party', 'adventure'],
  },
  {
    name: 'Sunrise Hike',
    description: 'Early morning hike to a scenic viewpoint for a stunning sunrise.',
    duration: '3 hours',
    estimatedCost: 25,
    category: 'adventure',
    persona: ['adventure'],
  },
  {
    name: 'Cycling City Tour',
    description: 'Explore the city on two wheels with a local guide.',
    duration: '4 hours',
    estimatedCost: 30,
    category: 'adventure',
    persona: ['adventure', 'culture'],
  },
  {
    name: 'Luxury Spa Day',
    description: 'Full-day wellness retreat at a premium spa resort.',
    duration: 'Full day',
    estimatedCost: 150,
    category: 'wellness',
    persona: ['relaxed'],
  },
  {
    name: 'Private Photography Walk',
    description: 'A personal photographer guides you to the best photo spots.',
    duration: '3 hours',
    estimatedCost: 90,
    category: 'photography',
    persona: ['culture', 'foodie', 'relaxed'],
  },
  {
    name: 'Local Market Experience',
    description: 'Shop like a local in traditional markets with a bilingual guide.',
    duration: '2 hours',
    estimatedCost: 20,
    category: 'culture',
    persona: ['culture', 'foodie', 'adventure'],
  },
];

export function getRecommendedTours(travelStyle: string, vibes: string[]): Tour[] {
  const persona = travelStyle.toLowerCase();

  const scored = TOUR_CATALOG.map((tour) => {
    let score = 0;
    if (tour.persona.includes(persona)) score += 3;

    // Boost based on vibes
    const vibeMatches: Record<string, string[]> = {
      vibrant: ['nightlife', 'adventure', 'food'],
      relaxed: ['wellness', 'culture'],
      adventurous: ['adventure'],
      modern: ['nightlife', 'photography'],
      historical: ['culture'],
      foodie: ['food'],
    };

    vibes.forEach((vibe) => {
      const matchCategories = vibeMatches[vibe.toLowerCase()] || [];
      if (matchCategories.includes(tour.category)) score += 1;
    });

    return { ...tour, score };
  });

  return scored
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score: _score, ...tour }) => tour);
}
