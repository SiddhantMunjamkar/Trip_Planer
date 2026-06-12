export interface CostBreakdown {
  hotelCost: number;
  foodCost: number;
  activityCost: number;
  transportCost: number;
  totalCost: number;
  perPersonCost: number;
  currency: string;
}

type Tier = 'budget' | 'comfort' | 'luxury';
type GroupType = 'solo' | 'couple' | 'family' | 'friends';

const FOOD_COSTS: Record<Tier, { mealsPerDay: number; costPerMeal: number }> = {
  budget: { mealsPerDay: 3, costPerMeal: 10 },
  comfort: { mealsPerDay: 3, costPerMeal: 30 },
  luxury: { mealsPerDay: 3, costPerMeal: 80 },
};

const ACTIVITY_COSTS: Record<Tier, number> = {
  budget: 15,
  comfort: 40,
  luxury: 100,
};

const TRANSPORT_RATES: Record<Tier, number> = {
  budget: 5,   // per km
  comfort: 10,
  luxury: 25,
};

const GROUP_MULTIPLIERS: Record<GroupType, number> = {
  solo: 1,
  couple: 2,
  family: 3.5,
  friends: 4,
};

export function calculateCost(
  tier: Tier,
  hotelPricePerNight: number,
  days: number,
  totalDistanceKm: number,
  numberOfActivities: number,
  groupType: GroupType = 'solo'
): CostBreakdown {
  const groupSize = GROUP_MULTIPLIERS[groupType] || 1;

  const hotelCost = hotelPricePerNight * days;
  const { mealsPerDay, costPerMeal } = FOOD_COSTS[tier];
  const foodCost = mealsPerDay * costPerMeal * days;
  const activityCost = ACTIVITY_COSTS[tier] * numberOfActivities;
  const transportCost = Math.ceil(totalDistanceKm * TRANSPORT_RATES[tier] / 10); // /10 for reasonableness

  const totalPerPerson = hotelCost + foodCost + activityCost + transportCost;
  const totalCost = parseFloat((totalPerPerson * groupSize).toFixed(2));

  return {
    hotelCost: parseFloat((hotelCost * groupSize).toFixed(2)),
    foodCost: parseFloat((foodCost * groupSize).toFixed(2)),
    activityCost: parseFloat((activityCost * groupSize).toFixed(2)),
    transportCost: parseFloat((transportCost * groupSize).toFixed(2)),
    totalCost,
    perPersonCost: parseFloat(totalPerPerson.toFixed(2)),
    currency: 'USD',
  };
}
