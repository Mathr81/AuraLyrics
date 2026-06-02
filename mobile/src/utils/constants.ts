export const SPOTIFY_CLIENT_ID = "46d320ac2a84489db4c60630bf7418aa"; // à remplir depuis le Spotify Developer Dashboard
export const SPOTIFY_REDIRECT_URI = "auralyrics://auth/callback";
export const SPOTIFY_SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

export const SPICY_LYRICS_API = "https://api.spicylyrics.org";
export const LYRICS_CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 jours

export const PLAYBACK_POLL_INTERVAL_MS = 1000;

// Opacités des lignes (identiques à l'extension)
export const OPACITY_ACTIVE = 1;
export const OPACITY_SUNG = 0.497;
export const OPACITY_NOT_SUNG = 0.51;

// Scale des lignes
export const SCALE_ACTIVE_LINE = 1.05; // type Line
export const SCALE_DEFAULT = 1;
