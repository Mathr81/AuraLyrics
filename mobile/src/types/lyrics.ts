export type LyricsType = 'Syllable' | 'Line' | 'Static';
export type LineState = 'NotSung' | 'Active' | 'Sung';

export interface LyricsLetter {
  Text: string;
  StartTime: number;
  EndTime: number;
}

export interface LyricsSyllable {
  Text: string;
  StartTime: number;
  EndTime: number;
  IsPartOfWord?: boolean;
  IsBackground?: boolean;
  Letters?: LyricsLetter[];
}

export interface LyricsLine {
  StartTime: number;
  EndTime: number;
  Text?: string;
  OppositeAligned?: boolean; // duet: second singer
  IsBackground?: boolean;    // bg-line
  IsDotLine?: boolean;       // musical/instrumental line
  Lead?: LyricsSyllable[];   // syllable-level sync
  Syllables?: {
    Lead: LyricsSyllable[];
  };
}

export interface LyricsData {
  id: string;
  Type: LyricsType;
  Content: LyricsLine[];
  HasTransliterations?: boolean;
  Credits?: string;
  LyricsProvider?: string;
}
