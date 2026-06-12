import axios from 'axios';
import https from 'https';
import { YoutubeTranscript } from 'youtube-transcript';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Custom fetch that bypasses broken SSL certs on some Windows setups */
async function axiosFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = (init?.method ?? 'GET').toUpperCase();
  const headers = init?.headers as Record<string, string> | undefined;
  const body = init?.body as string | undefined;

  const response = await axios({
    url,
    method,
    headers,
    data: body,
    httpsAgent,
    timeout: 25000,
    validateStatus: () => true,
    responseType: 'text',
    maxRedirects: 5,
  });

  const responseBody = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    headers: new Headers(response.headers as Record<string, string>),
    text: async () => responseBody,
    json: async () => JSON.parse(responseBody),
  } as Response;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function normalizeTranscriptError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);

  if (message.toLowerCase().includes('429') || message.toLowerCase().includes('too many')) {
    return new Error('YouTube transcript rate limit reached. Wait a minute and try again.');
  }
  if (
    message.toLowerCase().includes('disabled') ||
    message.toLowerCase().includes('not available') ||
    message.toLowerCase().includes('no transcripts')
  ) {
    return new Error('This video has no available transcript/captions.');
  }
  if (message.toLowerCase().includes('unavailable')) {
    return new Error('This YouTube video is unavailable or private.');
  }
  if (message.toLowerCase().includes('fetch failed') || message.toLowerCase().includes('network')) {
    return new Error('Could not reach YouTube. Check your internet connection and try again.');
  }

  return new Error(`Failed to fetch YouTube transcript: ${message.replace(/^\[YoutubeTranscript\]\s*🚨\s*/, '')}`);
}

export async function fetchYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) throw new Error('Invalid YouTube URL');

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId, {
        fetch: axiosFetch,
        ...(attempt === 1 ? { lang: 'en' } : {}),
      });

      if (!segments.length) {
        throw new Error('No transcript found for this video. Try a video with captions enabled.');
      }

      return segments.map((s) => s.text).join(' ');
    } catch (error) {
      lastError = normalizeTranscriptError(error);
      if (attempt < 3) {
        await sleep(attempt * 1500);
        continue;
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch YouTube transcript');
}
