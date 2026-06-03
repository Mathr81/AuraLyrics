import { SPOTIFY_INTERNAL_TOKEN } from '../utils/constants';

// Returns the hardcoded Spicetify token if set, otherwise null.
// Token lasts ~1h — refresh from: Spicetify DevTools → Spicetify.Platform.Session.accessToken
export function getSpotifyInternalToken(): string | null {
  return SPOTIFY_INTERNAL_TOKEN || null;
}
