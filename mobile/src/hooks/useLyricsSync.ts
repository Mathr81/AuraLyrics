import { useMemo, useRef } from 'react';
import type { LyricsData, LyricsLine, LineState } from '../types/lyrics';

export interface SyncedLine extends LyricsLine {
  index: number;
  state: LineState;
}

function getLineTiming(line: LyricsLine): { start: number; end: number } {
  const rawLead = (line as any).Lead;
  const syls = Array.isArray(rawLead) ? rawLead : rawLead?.Syllables;
  return {
    start: line.StartTime ?? syls?.[0]?.StartTime ?? 0,
    end:   line.EndTime   ?? syls?.[syls.length - 1]?.EndTime ?? 0,
  };
}

export function useLyricsSync(
  lyrics: LyricsData | null,
  progressMs: number,
): { lines: SyncedLine[]; activeIndex: number } {
  // Cache line objects so memo in LyricsLine can skip unchanged items
  const cache      = useRef<Record<number, SyncedLine>>({});
  const prevActive = useRef(-1);
  // Track lyrics object identity — clear stale cache on track change.
  // Without this, changing tracks returns old SyncedLine objects (with old text)
  // for lines whose state happens to match (both NotSung), causing the previous
  // track's lyrics to linger until each line becomes active.
  const lyricsIdRef = useRef<LyricsData | null>(null);

  // O(n) scan every 100ms — no allocations, very fast
  const activeIndex = useMemo(() => {
    if (!lyrics || lyrics.Type === 'Static') return -1;
    const prog = progressMs / 1000;
    for (let i = 0; i < lyrics.Content.length; i++) {
      const { start, end } = getLineTiming(lyrics.Content[i]);
      if (end > 0 && prog >= start && prog < end) return i;
    }
    return -1;
  }, [lyrics, progressMs]);

  // Track highest active index for Sung state during inter-line gaps
  if (activeIndex >= 0) prevActive.current = activeIndex;

  // Lines: only recomputes when activeIndex changes (every few seconds, not 100ms!)
  // Returns stable (cached) objects for lines whose state didn't change → LyricsLine memo works
  const lines = useMemo(() => {
    if (!lyrics) {
      cache.current = {};
      return [];
    }

    if (lyricsIdRef.current !== lyrics) {
      lyricsIdRef.current = lyrics;
      cache.current = {};
    }

    if (lyrics.Type === 'Static') {
      return lyrics.Content.map((l, i) => {
        const line = { ...l, index: i, state: 'Active' as LineState };
        cache.current[i] = line;
        return line;
      });
    }

    const sungBoundary = activeIndex >= 0 ? activeIndex - 1 : prevActive.current;

    return lyrics.Content.map((line, i) => {
      const newState: LineState =
        i === activeIndex  ? 'Active'  :
        i <= sungBoundary  ? 'Sung'    :
        'NotSung';

      // Return same object if state unchanged → LyricsLine memo skips re-render
      const cached = cache.current[i];
      if (cached && cached.state === newState) return cached;

      const newLine: SyncedLine = { ...line, index: i, state: newState };
      cache.current[i] = newLine;
      return newLine;
    });
  }, [lyrics, activeIndex]); // ← progressMs removed! runs only at line boundaries

  return { lines, activeIndex };
}
