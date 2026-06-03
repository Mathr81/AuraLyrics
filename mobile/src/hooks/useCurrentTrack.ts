import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlaybackState } from '../services/spotify';
import type { SpotifyPlaybackState } from '../types/spotify';
import { PLAYBACK_POLL_INTERVAL_MS } from '../utils/constants';

// Progress interpolation interval — 100ms is enough precision for lyric sync
// (avoids requestAnimationFrame which Reanimated intercepts and causes Worklets warnings)
const PROGRESS_TICK_MS = 100;

export function useCurrentTrack(getValidToken: () => Promise<string | null>) {
  const [playback, setPlayback]   = useState<SpotifyPlaybackState | null>(null);
  const [progressMs, setProgressMs] = useState(0);

  const lastApiProgressRef  = useRef(0);
  const lastApiTimestampRef = useRef(0);
  const isPlayingRef        = useRef(false);

  const poll = useCallback(async () => {
    const token = await getValidToken();
    if (!token) return;
    try {
      const state = await getPlaybackState(token);
      if (!state) return;
      setPlayback(state);
      lastApiProgressRef.current  = state.progress_ms;
      lastApiTimestampRef.current = Date.now();
      isPlayingRef.current        = state.is_playing;
    } catch {
      // network error — keep last known state
    }
  }, [getValidToken]);

  useEffect(() => {
    poll();
    const apiInterval = setInterval(poll, PLAYBACK_POLL_INTERVAL_MS);

    // Interpolate progress between API polls at 100ms (10fps — enough for lyric sync)
    const progressInterval = setInterval(() => {
      if (!isPlayingRef.current) return;
      const elapsed = Date.now() - lastApiTimestampRef.current;
      setProgressMs(lastApiProgressRef.current + elapsed);
    }, PROGRESS_TICK_MS);

    return () => {
      clearInterval(apiInterval);
      clearInterval(progressInterval);
    };
  }, [poll]);

  return { playback, progressMs };
}
