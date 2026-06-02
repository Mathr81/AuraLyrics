import { useMemo } from 'react';
import type { LyricsData, LyricsLine, LineState } from '../types/lyrics';

export interface SyncedLine extends LyricsLine {
  index: number;
  state: LineState;
}

export function useLyricsSync(
  lyrics: LyricsData | null,
  progressMs: number,
): { lines: SyncedLine[]; activeIndex: number } {
  return useMemo(() => {
    if (!lyrics || lyrics.Type === 'Static') {
      const lines: SyncedLine[] = (lyrics?.Content ?? []).map((l, i) => ({
        ...l,
        index: i,
        state: 'Active' as LineState,
      }));
      return { lines, activeIndex: -1 };
    }

    const progressSec = progressMs / 1000;
    let activeIndex = -1;

    const lines: SyncedLine[] = lyrics.Content.map((line, i) => {
      const start = line.StartTime ?? 0;
      const end = line.EndTime ?? 0;

      let state: LineState;
      if (progressSec >= start && progressSec < end) {
        state = 'Active';
        activeIndex = i;
      } else if (progressSec >= end) {
        state = 'Sung';
      } else {
        state = 'NotSung';
      }

      return { ...line, index: i, state };
    });

    return { lines, activeIndex };
  }, [lyrics, progressMs]);
}
