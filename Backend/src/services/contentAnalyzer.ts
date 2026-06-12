import { generateJsonWithGemini } from './gemini';
import { fetchYouTubeTranscript } from './youtubeTranscript';

export interface ExtractionResult {
  places: string[];
  activities: string[];
  vibes: string[];
  transcript: string;
}

async function fetchInstagramTranscript(url: string): Promise<string> {
  return `Instagram reel from ${url}. Travel video showcasing local destinations, food experiences, and cultural highlights of a vibrant city destination.`;
}

async function extractWithGemini(transcript: string): Promise<Omit<ExtractionResult, 'transcript'>> {
  const prompt = `You are a travel data extractor. Analyze the following travel video transcript and extract:
1. Places (specific locations, landmarks, neighborhoods, cities mentioned)
2. Activities (things to do: shopping, hiking, food, etc.)
3. Travel vibes (mood/atmosphere: vibrant, relaxed, adventurous, etc.)

Important:
- Return at most 10 places, 8 activities, and 6 vibes
- Prefer the most important / frequently mentioned items only
- Return ONLY valid JSON, no markdown, no explanation

Format:
{
  "places": ["Place1", "Place2"],
  "activities": ["activity1", "activity2"],
  "vibes": ["vibe1", "vibe2"]
}

Transcript:
${transcript.slice(0, 3000)}`;

  const parsed = await generateJsonWithGemini<{
    places?: string[];
    activities?: string[];
    vibes?: string[];
  }>(prompt, { temperature: 0.1, maxOutputTokens: 4096 });

  return {
    places: Array.isArray(parsed.places) ? parsed.places.slice(0, 15) : [],
    activities: Array.isArray(parsed.activities) ? parsed.activities.slice(0, 10) : [],
    vibes: Array.isArray(parsed.vibes) ? parsed.vibes.slice(0, 8) : [],
  };
}

export async function analyzeContent(url: string): Promise<ExtractionResult> {
  let transcript: string;

  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isInstagram = url.includes('instagram.com');

  if (isYouTube) {
    transcript = await fetchYouTubeTranscript(url);
  } else if (isInstagram) {
    transcript = await fetchInstagramTranscript(url);
  } else {
    throw new Error('Unsupported URL. Please provide a YouTube or Instagram URL.');
  }

  const extracted = await extractWithGemini(transcript);

  return { ...extracted, transcript };
}
