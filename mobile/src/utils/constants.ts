export const SPOTIFY_CLIENT_ID = "46d320ac2a84489db4c60630bf7418aa";
export const SPOTIFY_REDIRECT_URI = "auralyrics://auth/callback";

// Token interne Spotify — récupéré depuis Spicetify DevTools (dure ~1h)
// 1. Ouvre Spotify desktop avec Spicetify
// 2. Ctrl+Shift+I → Console
// 3. Tape : Spicetify.Platform.Session.accessToken
// 4. Colle la valeur ci-dessous
// Si les paroles reviennent en "Static", le token a expiré → renouvelle-le
export const SPOTIFY_INTERNAL_TOKEN =
  "BQDvupNsGbVm54a6UFaje4xAiURZlOE0zJByRVphNq-rrSuoiN1UTcsCJiP6de5TW1UCaKNIE0GaGLY-2NTh9OOuyJDcOHQ1n_PU4UA_gQJxIIqf_5xYuvY5q4oTlT2FbggQsCHGGNrO0gSy616kJqQfByH58t-RVUPyDTQNy1EX6hI7NHUh61lHWQ7gacqgCNLi3rn_7nxtx24KEF6NpFK8bB_nupJV27Z2dWR29BQ5oMvP9nIhbpJFEqGM2WI68IleJ8eEAFelZFjM0LBtagFkqRNmw4ghEVJtdhid4AqA_vdS3gwnTwyGo0obhE1sDMmYSY93sHS2zwoV5dmg78hd2kumeZ3wUF-HnY8LIrNnbyq0wpGxj391apJ8gFEkHXZnDSeaZ3lDhOK1KgAobwjQO0Gkr2gJ1J57Hjc3Dhk68JPGlWL26_QLtPdlZ_WA-GlhCPGro7DMevWzFfj7GQ3aekPXMoTI3Zzih7xprbloZzGp04EFSog";
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
