// Mock data for ReelTrip AI dashboard
// All data structures for extraction results, personas, itineraries, costs, and tour recommendations

import {
  Utensils,
  Mountain,
  Landmark,
  Waves,
  User,
  HeartHandshake,
  Users,
  UsersRound,
  Turtle,
  Gauge,
  Zap,
  LucideIcon,
} from "lucide-react";

export const extractionMockData = {
  places: ["Shibuya Crossing", "Senso-ji Temple", "Meiji Shrine", "Akihabara", "Harajuku"],
  activities: ["Temple exploring", "Street food tasting", "Shopping", "Gaming arcade", "Nightlife"],
  vibes: ["Vibrant", "Historic", "Modern", "Energetic", "Cultural"],
};

export const personaOptions = {
  styles: [
    { value: "foodie", label: "Foodie", icon: Utensils },
    { value: "adventure", label: "Adventure", icon: Mountain },
    { value: "culture", label: "Culture", icon: Landmark },
    { value: "relax", label: "Relaxation", icon: Waves },
  ],
  groups: [
    { value: "solo", label: "Solo", icon: User },
    { value: "couple", label: "Couple", icon: HeartHandshake },
    { value: "friends", label: "Friends", icon: Users },
    { value: "family", label: "Family", icon: UsersRound },
  ],
  paces: [
    { value: "relaxed", label: "Relaxed", icon: Turtle },
    { value: "moderate", label: "Moderate", icon: Gauge },
    { value: "fast", label: "Fast", icon: Zap },
  ],
};

export type TravelStyle = "foodie" | "adventure" | "culture" | "relax";
export type GroupType = "solo" | "couple" | "friends" | "family";
export type TravelPace = "relaxed" | "moderate" | "fast";

interface HotelOption {
  name: string;
  location: string;
  price: number;
  rating: number;
  amenities: string[];
}

interface RestaurantOption {
  name: string;
  cuisine: string;
  pricePerPerson: number;
  rating: number;
}

interface Activity {
  time: string;
  place: string;
  category: string;
  description: string;
  duration: string;
}

interface Day {
  day: number;
  activities: Activity[];
}

interface Itinerary {
  id: "budget" | "comfort" | "luxury";
  name: string;
  description: string;
  total: number;
  hotels: HotelOption[];
  restaurants: RestaurantOption[];
  days: Day[];
  costs: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    transport: number;
  };
}

export const itinerariesMockData: Itinerary[] = [
  {
    id: "budget",
    name: "Budget Backpacker",
    description: "Affordable adventure with local experiences",
    total: 650,
    hotels: [
      {
        name: "Hostel Mondo",
        location: "Asakusa",
        price: 25,
        rating: 4.2,
        amenities: ["Shared dorms", "Common kitchen", "Free WiFi"],
      },
      {
        name: "Khaosan Tokyo Kabuki",
        location: "Asakusa",
        price: 28,
        rating: 4.1,
        amenities: ["Budget rooms", "Social atmosphere", "Free breakfast"],
      },
      {
        name: "Book and Bed",
        location: "Shinjuku",
        price: 35,
        rating: 3.9,
        amenities: ["Capsule pods", "Library", "Minimalist"],
      },
    ],
    restaurants: [
      { name: "Tsukiji Outer Market", cuisine: "Sushi & Seafood", pricePerPerson: 12, rating: 4.5 },
      { name: "Ichiran Ramen", cuisine: "Ramen", pricePerPerson: 8, rating: 4.3 },
      { name: "Gonpachi", cuisine: "Izakaya", pricePerPerson: 15, rating: 4.2 },
      { name: "Marui Curryhouse", cuisine: "Curry", pricePerPerson: 10, rating: 4.0 },
    ],
    costs: {
      flights: 200,
      accommodation: 150,
      food: 150,
      activities: 100,
      transport: 50,
    },
    days: [
      {
        day: 1,
        activities: [
          {
            time: "9:00 AM",
            place: "Tsukiji Outer Market",
            category: "Food",
            description: "Start with fresh sushi and seafood at the iconic Tsukiji market.",
            duration: "2 hours",
          },
          {
            time: "12:00 PM",
            place: "Senso-ji Temple",
            category: "Culture",
            description: "Visit Tokyo's oldest temple with stunning architecture.",
            duration: "1.5 hours",
          },
          {
            time: "3:00 PM",
            place: "Asakusa District",
            category: "Shopping",
            description: "Explore traditional shops and street vendors.",
            duration: "2 hours",
          },
          {
            time: "7:00 PM",
            place: "Convenience Store Dinner",
            category: "Food",
            description: "Enjoy affordable and delicious meals at local convenience stores.",
            duration: "1 hour",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            time: "9:00 AM",
            place: "Meiji Shrine",
            category: "Culture",
            description: "Walk through serene forest paths to reach this free sacred shrine.",
            duration: "1.5 hours",
          },
          {
            time: "11:30 AM",
            place: "Harajuku & Takeshita Street",
            category: "Shopping",
            description: "Experience youth culture and quirky fashion.",
            duration: "2 hours",
          },
          {
            time: "2:00 PM",
            place: "Yoyogi Park",
            category: "Nature",
            description: "Relax in this beautiful free public park.",
            duration: "1.5 hours",
          },
          {
            time: "7:00 PM",
            place: "Street Food Night",
            category: "Food",
            description: "Experience local street food stalls with authentic flavors.",
            duration: "1.5 hours",
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            time: "10:00 AM",
            place: "Akihabara",
            category: "Tech & Gaming",
            description: "Explore the electric town with gaming arcades and anime shops.",
            duration: "2 hours",
          },
          {
            time: "1:00 PM",
            place: "Ramen Alley",
            category: "Food",
            description: "Try authentic ramen at affordable prices.",
            duration: "1 hour",
          },
          {
            time: "3:00 PM",
            place: "Ueno Park",
            category: "Nature",
            description: "Enjoy peaceful gardens and museums.",
            duration: "2 hours",
          },
          {
            time: "7:00 PM",
            place: "Shibuya Crossing & Night Walk",
            category: "Views",
            description: "Experience the world's busiest crossing with neon lights.",
            duration: "1.5 hours",
          },
        ],
      },
    ],
  },
  {
    id: "comfort",
    name: "Comfort Traveler",
    description: "Balanced experience with quality accommodations and dining",
    total: 1500,
    hotels: [
      {
        name: "Hotel Gracery Shinjuku",
        location: "Shinjuku",
        price: 120,
        rating: 4.4,
        amenities: ["4-star hotel", "Onsen bath", "Restaurant & bar"],
      },
      {
        name: "Richmond Hotel Ginza",
        location: "Ginza",
        price: 130,
        rating: 4.5,
        amenities: ["4-star hotel", "Spa facilities", "Fine dining"],
      },
      {
        name: "Hotel Sunroute Plaza Shinjuku",
        location: "Shinjuku",
        price: 110,
        rating: 4.3,
        amenities: ["Central location", "Business facilities", "Restaurant"],
      },
    ],
    restaurants: [
      { name: "Sukiyaki Nakamura", cuisine: "Wagyu & Sukiyaki", pricePerPerson: 65, rating: 4.7 },
      { name: "Tempura Daikichi", cuisine: "Tempura", pricePerPerson: 45, rating: 4.6 },
      { name: "Tonki", cuisine: "Tonkatsu", pricePerPerson: 35, rating: 4.5 },
      { name: "Sushi Zanmai", cuisine: "Premium Sushi", pricePerPerson: 55, rating: 4.6 },
    ],
    costs: {
      flights: 400,
      accommodation: 450,
      food: 350,
      activities: 225,
      transport: 75,
    },
    days: [
      {
        day: 1,
        activities: [
          {
            time: "10:00 AM",
            place: "teamLab Borderless",
            category: "Art & Tech",
            description: "Immersive digital art museum with interactive installations.",
            duration: "3 hours",
          },
          {
            time: "1:30 PM",
            place: "Ginza Shopping District",
            category: "Shopping",
            description: "Explore luxury brands and department stores.",
            duration: "2.5 hours",
          },
          {
            time: "6:00 PM",
            place: "Sukiyaki Dinner",
            category: "Food",
            description: "Fine dining experience with premium Japanese cuisine.",
            duration: "2 hours",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            time: "8:00 AM",
            place: "Mount Fuji Day Trip",
            category: "Nature",
            description: "Scenic tour with views of Japan's iconic mountain.",
            duration: "8 hours",
          },
          {
            time: "7:00 PM",
            place: "Onsen & Kaiseki Dinner",
            category: "Relaxation & Food",
            description: "Traditional hot spring followed by multi-course meal.",
            duration: "3 hours",
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            time: "10:00 AM",
            place: "Meiji Shrine & Omotesando",
            category: "Culture & Shopping",
            description: "Historic shrine followed by upscale shopping avenue.",
            duration: "3 hours",
          },
          {
            time: "2:00 PM",
            place: "Tea Ceremony Experience",
            category: "Culture",
            description: "Learn traditional Japanese tea ceremony.",
            duration: "1.5 hours",
          },
          {
            time: "7:00 PM",
            place: "Tempura Dinner at Daikichi",
            category: "Food",
            description: "Counter-style tempura with expertly fried selections.",
            duration: "1.5 hours",
          },
        ],
      },
    ],
  },
  {
    id: "luxury",
    name: "Luxury Escape",
    description: "Premium experiences with exclusive accommodations and fine dining",
    total: 4200,
    hotels: [
      {
        name: "The Peninsula Tokyo",
        location: "Ginza",
        price: 650,
        rating: 4.9,
        amenities: ["5-star luxury", "Michelin-starred restaurant", "Spa & pool"],
      },
      {
        name: "Mandarin Oriental Tokyo",
        location: "Nihonbashi",
        price: 700,
        rating: 4.9,
        amenities: ["5-star luxury", "Top-floor spa", "Exclusive lounge"],
      },
      {
        name: "Four Seasons Hotel Tokyo",
        location: "Marunouchi",
        price: 750,
        rating: 5.0,
        amenities: ["5-star ultra-luxury", "Personal concierge", "Fine dining"],
      },
    ],
    restaurants: [
      { name: "3-Michelin-Star Nabezo", cuisine: "Kaiseki", pricePerPerson: 250, rating: 4.9 },
      { name: "Sukiyabashi Jiro", cuisine: "Omakase Sushi", pricePerPerson: 320, rating: 4.9 },
      { name: "Aman Spa Dining", cuisine: "Japanese-French Fusion", pricePerPerson: 280, rating: 4.8 },
      {
        name: "Kozantei Ubuya",
        cuisine: "High-end Kaiseki",
        pricePerPerson: 200,
        rating: 4.8,
      },
    ],
    costs: {
      flights: 800,
      accommodation: 1500,
      food: 1000,
      activities: 700,
      transport: 200,
    },
    days: [
      {
        day: 1,
        activities: [
          {
            time: "10:00 AM",
            place: "Private Shopping Tour in Ginza",
            category: "Exclusive Shopping",
            description: "Personalized shopping experience with luxury brand specialists.",
            duration: "3 hours",
          },
          {
            time: "2:00 PM",
            place: "Aman Spa Wellness Experience",
            category: "Wellness",
            description: "Exclusive spa treatments in private suites.",
            duration: "2 hours",
          },
          {
            time: "7:00 PM",
            place: "Nabezo Kaiseki Dinner",
            category: "Fine Dining",
            description: "3-Michelin-star multi-course Japanese haute cuisine.",
            duration: "2.5 hours",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            time: "7:00 AM",
            place: "Private Mt. Fuji Helicopter Tour",
            category: "Adventure",
            description: "Exclusive aerial views of Mt. Fuji and surrounding peaks.",
            duration: "3 hours",
          },
          {
            time: "1:00 PM",
            place: "Hakone Exclusive Resort",
            category: "Relaxation",
            description: "Private onsen with mountain views and gourmet lunch.",
            duration: "4 hours",
          },
          {
            time: "7:00 PM",
            place: "Jiro Omakase Sushi Experience",
            category: "Fine Dining",
            description: "Legendary sushi chef's 20-piece omakase at the counter.",
            duration: "2 hours",
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            time: "9:00 AM",
            place: "Imperial Palace Private Guided Tour",
            category: "Exclusive Access",
            description: "VIP access to restricted Imperial Palace areas.",
            duration: "2 hours",
          },
          {
            time: "12:00 PM",
            place: "Michelin-starred Lunch Experience",
            category: "Fine Dining",
            description: "Exclusive lunch at acclaimed restaurant.",
            duration: "2 hours",
          },
          {
            time: "3:00 PM",
            place: "Tokyo National Museum Exclusive Tour",
            category: "Culture",
            description: "Private curator-led tour of rare artifacts.",
            duration: "2 hours",
          },
          {
            time: "7:00 PM",
            place: "Aman Private Dining",
            category: "Fine Dining",
            description: "Bespoke private dining experience in hotel suite.",
            duration: "2.5 hours",
          },
        ],
      },
    ],
  },
];

// Recommendation logic based on persona
export function getRecommendedItinerary(
  style: TravelStyle,
  group: GroupType,
  pace: TravelPace
): "budget" | "comfort" | "luxury" {
  // Family and couple tend to prefer comfort
  if (group === "family" || group === "couple") {
    return "comfort";
  }

  // Foodie and culture enthusiasts prefer comfort to luxury
  if (style === "foodie" || style === "culture") {
    return "comfort";
  }

  // Fast-paced travelers prefer luxury for efficiency
  if (pace === "fast") {
    return "luxury";
  }

  // Default to comfort
  return "comfort";
}

export const toursMockData: Record<"budget" | "comfort" | "luxury", any[]> = {
  budget: [
    {
      name: "Free Walking Tour",
      price: 0,
      rating: 4.4,
      duration: "3 hours",
      description: "Guided tour through central Tokyo neighborhoods",
    },
    {
      name: "Ramen Making Workshop",
      price: 35,
      rating: 4.5,
      duration: "2 hours",
      description: "Learn to make authentic ramen from scratch",
    },
    {
      name: "Karaoke Night Experience",
      price: 25,
      rating: 4.3,
      duration: "2 hours",
      description: "Fun night out at a local karaoke spot",
    },
    {
      name: "Temple Photography Tour",
      price: 20,
      rating: 4.2,
      duration: "2 hours",
      description: "Guided photography session at temples",
    },
  ],
  comfort: [
    {
      name: "Premium Food Tour",
      price: 120,
      rating: 4.7,
      duration: "3 hours",
      description: "Curated tasting tour of Tokyo's best restaurants",
    },
    {
      name: "Cooking Class Experience",
      price: 95,
      rating: 4.6,
      duration: "2.5 hours",
      description: "Learn to cook with a professional chef",
    },
    {
      name: "Mount Fuji Day Trip",
      price: 150,
      rating: 4.8,
      duration: "8 hours",
      description: "Guided tour to Mt. Fuji with scenic views",
    },
    {
      name: "Tea Ceremony & Museum",
      price: 110,
      rating: 4.5,
      duration: "3 hours",
      description: "Traditional tea ceremony with museum visit",
    },
  ],
  luxury: [
    {
      name: "Private Chef's Dining Experience",
      price: 450,
      rating: 4.9,
      duration: "4 hours",
      description: "Exclusive multi-course dinner with private chef",
    },
    {
      name: "VIP Mt. Fuji Helicopter Tour",
      price: 1200,
      rating: 4.95,
      duration: "3 hours",
      description: "Exclusive aerial views of Mt. Fuji from helicopter",
    },
    {
      name: "Exclusive Museum Private Tour",
      price: 350,
      rating: 4.9,
      duration: "2.5 hours",
      description: "Private curator-led tour of Tokyo's finest museum",
    },
    {
      name: "Michelin-Star Restaurant Tasting",
      price: 500,
      rating: 5.0,
      duration: "3 hours",
      description: "Multi-course tasting at a 3-Michelin-star restaurant",
    },
  ],
};
