export const SPOTIFY_CLIENT_ID = "46d320ac2a84489db4c60630bf7418aa";
export const SPOTIFY_REDIRECT_URI = "auralyrics://auth/callback";

// Token interne Spotify — récupéré depuis Spicetify DevTools (dure ~1h)
// 1. Ouvre Spotify desktop avec Spicetify
// 2. Ctrl+Shift+I → Console
// 3. Tape : Spicetify.Platform.Session.accessToken
// 4. Colle la valeur ci-dessous
// Si les paroles reviennent en "Static", le token a expiré → renouvelle-le
export const SPOTIFY_INTERNAL_TOKEN =
  "BQAfHTJF2Aj1ReHMNvkUImedtERCSMDHJ14gDtr0W2ONFz7l-cIL9kGTsMRVRQZnd0PRu9RT-ThazmQy_yn0o1fPX1CFmVsSw9a5DvEBhviPQohNiLrAcWO-914WIhlmdoJvT0zzrPkcVljgG67dd4NLE92qa9gvIRUz9TzV0uPFnruOaTZw3W2gfhB22UqHtjzeBT1v4FFu0-U0KbiYxlmGazIbq4-Gfur-h9YpHnrXOovcGpKCT3kxRAecf7BemwGtFFmmLeQ4NhXO-B-4pMhjn-jHLwj4Eu1jpJrecjnzXtKMEL1rh6Ga8k7eLWYzALoVOkOBXVBjQlm267xlS_RT--gCPkiuGwlU5O118bEv6HNTKFxVlnj8SKG_y_vmB39X9pe9AQApN2z1MT9YDoJ7D4fUmGPER1Vf_bNLBVzwBXM-u4Aovr_M7ftcM948tBwPqfbjlWJFAl1WC-rDHU6gXiHUSJkf6o3778FZ6qJ256N8v5uoPjA";
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
