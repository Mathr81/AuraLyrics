import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchLyricsFromApi } from '../services/lyricsApi';
import type { LyricsData } from '../types/lyrics';
import { LYRICS_CACHE_TTL_MS } from '../utils/constants';

type LyricsStatus = 'idle' | 'loading' | 'ready' | 'no-lyrics' | 'error';

interface CacheEntry {
  data: LyricsData | null; // null means confirmed no-lyrics
  cachedAt: number;
}

function cacheKey(trackId: string) {
  return `lyrics_v3_${trackId}`;  // v3: StartTime/EndTime derived from syllables
}

export function useLyrics(
  trackId: string | null,
  getValidToken: () => Promise<string | null>,
) {
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [status, setStatus] = useState<LyricsStatus>('idle');
  const lastTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!trackId) {
      setLyrics(null);
      setStatus('idle');
      return;
    }

    if (trackId === lastTrackIdRef.current) return;
    lastTrackIdRef.current = trackId;

    let cancelled = false;

    (async () => {
      setStatus('loading');
      setLyrics(null);

      // Check cache
      try {
        const raw = await AsyncStorage.getItem(cacheKey(trackId));
        if (raw) {
          const entry: CacheEntry = JSON.parse(raw);
          const age = Date.now() - entry.cachedAt;
          if (age < LYRICS_CACHE_TTL_MS) {
            if (cancelled) return;
            if (entry.data === null) {
              setStatus('no-lyrics');
            } else {
              setLyrics(entry.data);
              setStatus('ready');
            }
            return;
          }
        }
      } catch {
        // cache miss or parse error — continue to fetch
      }

      // Fetch from API
      const token = await getValidToken();
      if (!token || cancelled) return;

      try {
        const data = await fetchLyricsFromApi(trackId, token);
        if (cancelled) return;
        const entry: CacheEntry = { data, cachedAt: Date.now() };
        await AsyncStorage.setItem(cacheKey(trackId), JSON.stringify(entry));
        if (data) {
          console.log('[Lyrics] Loaded:', data.Type, data.Content.length, 'lines');
          setLyrics(data);
          setStatus('ready');
        } else {
          console.log('[Lyrics] No lyrics for track', trackId);
          setStatus('no-lyrics');
        }
      } catch (e) {
        console.error('[Lyrics] Fetch error:', e);
        if (!cancelled) setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [trackId, getValidToken]);

  return { lyrics, status };
}
