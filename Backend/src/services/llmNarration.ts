import { DaySchedule } from './timeScheduler';
import { RankedHotel } from './hotelRanking';
import { RankedRestaurant } from './restaurantRanking';

export interface NarrationInput {
  tier: 'budget' | 'comfort' | 'luxury';
  destination: string;
  days: number;
  schedule: DaySchedule[];
  topHotel: RankedHotel | null;
  topRestaurants: RankedRestaurant[];
  vibes: string[];
  activities: string[];
}

export interface NarrationOutput {
  summary: string;
  dayDescriptions: { day: number; description: string }[];
}

/** Fast algorithmic narration — no Gemini call (avoids rate limits & timeouts) */
export function buildTemplateNarration(input: NarrationInput): NarrationOutput {
  const tierLabel = input.tier.charAt(0).toUpperCase() + input.tier.slice(1);
  const vibeText = input.vibes.slice(0, 3).join(', ') || 'unforgettable';
  const activityText = input.activities.slice(0, 3).join(', ') || 'local exploring';
  const hotel = input.topHotel?.name || `${input.destination} Hotel`;
  const restaurant = input.topRestaurants[0]?.name || 'nearby restaurants';

  const summary =
    `Your ${tierLabel} ${input.days}-day trip to ${input.destination} captures the ${vibeText} spirit of your video. ` +
    `Stay at ${hotel}, eat at ${restaurant}, and enjoy ${activityText} across carefully scheduled days.`;

  const dayDescriptions: { day: number; description: string }[] = [];

  for (let d = 1; d <= input.days; d++) {
    const daySchedule = input.schedule.find((s) => s.day === d);
    const stops = daySchedule
      ? daySchedule.activities.filter((a) => a.type === 'place').map((a) => a.name)
      : [];

    if (stops.length > 0) {
      dayDescriptions.push({
        day: d,
        description: `Day ${d}: Visit ${stops.join(', ')}, with lunch and dinner stops planned nearby.`,
      });
    } else {
      dayDescriptions.push({
        day: d,
        description: `Day ${d}: Explore more of ${input.destination} at a ${input.tier} pace.`,
      });
    }
  }

  return { summary, dayDescriptions };
}
