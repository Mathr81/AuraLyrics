import { useCallback, useEffect, useRef, useState } from 'react';
import { getPlaybackState } from '../services/spotify';
import type { SpotifyPlaybackState } from '../types/spotify';
import { PLAYBACK_POLL_INTERVAL_MS } from '../utils/constants';

export function useCurrentTrack(getValidToken: () => Promise<string | null>) {
  const [playback, setPlayback] = useState<SpotifyPlaybackState | null>(null);
  const [progressMs, setProgressMs] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);

  // Last known timestamp from the API for local interpolation
  const lastApiProgressRef = useRef(0);
  const lastApiTimestampRef = useRef(0);
  const isPlayingRef = useRef(false);

  const poll = useCallback(async () => {
    const token = await getValidToken();
    if (!token) return;
    try {
      const state = await getPlaybackState(token);
      if (!state) return;
      setPlayback(state);
      lastApiProgressRef.current = state.progress_ms;
      lastApiTimestampRef.current = Date.now();
      isPlayingRef.current = state.is_playing;
    } catch {
      // network error — keep last known state
    }
  }, [getValidToken]);

  // Interpolate progress at 60fps between API polls
  const animateProgress = useCallback(() => {
    if (isPlayingRef.current) {
      const elapsed = Date.now() - lastApiTimestampRef.current;
      setProgressMs(lastApiProgressRef.current + elapsed);
    }
    rafRef.current = requestAnimationFrame(animateProgress);
  }, []);

  useEffect(() => {
    poll();
    pollRef.current = setInterval(poll, PLAYBACK_POLL_INTERVAL_MS);
    rafRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [poll, animateProgress]);

  return { playback, progressMs };
}
