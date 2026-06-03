export const SPOTIFY_CLIENT_ID = "46d320ac2a84489db4c60630bf7418aa";
export const SPOTIFY_REDIRECT_URI = "auralyrics://auth/callback";

// Token interne Spotify — récupéré depuis Spicetify DevTools (dure ~1h)
// 1. Ouvre Spotify desktop avec Spicetify
// 2. Ctrl+Shift+I → Console
// 3. Tape : Spicetify.Platform.Session.accessToken
// 4. Colle la valeur ci-dessous
// Si les paroles reviennent en "Static", le token a expiré → renouvelle-le
export const SPOTIFY_INTERNAL_TOKEN =
  "BQClP0Tv73DmQtlqS8s6OQ_UWKJ6aMNnvqX4baZ4mAG1JKTgVhtmAEsixApkgkaMSAZjSWgWc8bxSvqkEJ-FA1mPOSvK9VdXvRbtPDjaTNIYfOH_zk5Ig5rt_6voRvoDAfvO04cN9sk0OOpPfW8De0jquO1dJQZmtDtltdm41O9GxnhvV_tg7WU3snJIzGoUhqEYbdNGHLwDluVGL9ZbmgE7kS1fh0XvRIprdkUAGVYlXLWaMV1jmSLxyKz4BQTLStoiKkWNN-vq22cF2M-4aMu8GZyOrqh8-tJMgMQ3flSttTJDK6VWm_2DPHbZOlpul7trRIMrlkHUpfqVtqUIge8snBMtkhoyGqir_v8NBKS7xuGtYeXd2R1C-siMpR57_uf2e63qzEDQLi6WGhBbq8zy0Y-tjXMczx-IcNkag_QO2jL7wgXZLcQ4tGffqAKYxd35jt-VKBvGp1dIfUDqfrbxfOumhhd4YqQPARsp-eZt91ZiiWT5M3g";
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
