import { SPICY_LYRICS_API } from '../utils/constants';
import type { LyricsData } from '../types/lyrics';

export async function fetchLyricsFromApi(
  trackId: string,
  accessToken: string,
): Promise<LyricsData | null> {
  const res = await fetch(`${SPICY_LYRICS_API}/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'SpicyLyrics-Version': '2.0.0',
      'SpicyLyrics-WebAuth': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      queries: [
        {
          operation: 'lyrics',
          variables: {
            id: trackId,
            auth: 'SpicyLyrics-WebAuth',
          },
        },
      ],
      client: { version: '2.0.0' },
    }),
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`SpicyLyrics API ${res.status}`);
  }

  const json = await res.json();
  const result = json?.queries?.[0]?.result;

  if (!result || result.httpStatus !== 200) return null;

  // The API returns packed data — unpack if it's a string, else use directly
  const data = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
  return data as LyricsData;
}
