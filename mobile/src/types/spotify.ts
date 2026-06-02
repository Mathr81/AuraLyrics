export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix timestamp ms
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: Array<{ url: string; width: number; height: number }>;
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  timestamp: number;
  item: SpotifyTrack | null;
}
