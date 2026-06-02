import type { SpotifyPlaybackState, SpotifyTokens } from '../types/spotify';

const BASE_URL = 'https://api.spotify.com/v1';

async function apiFetch<T>(
  path: string,
  accessToken: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });
  if (res.status === 204) return null as T;
  if (!res.ok) throw new Error(`Spotify API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function getPlaybackState(
  accessToken: string,
): Promise<SpotifyPlaybackState | null> {
  return apiFetch<SpotifyPlaybackState | null>('/me/player', accessToken);
}

export async function play(accessToken: string): Promise<void> {
  await apiFetch('/me/player/play', accessToken, { method: 'PUT' });
}

export async function pause(accessToken: string): Promise<void> {
  await apiFetch('/me/player/pause', accessToken, { method: 'PUT' });
}

export async function skipNext(accessToken: string): Promise<void> {
  await apiFetch('/me/player/next', accessToken, { method: 'POST' });
}

export async function skipPrevious(accessToken: string): Promise<void> {
  await apiFetch('/me/player/previous', accessToken, { method: 'POST' });
}

export async function seek(accessToken: string, positionMs: number): Promise<void> {
  await apiFetch(
    `/me/player/seek?position_ms=${Math.floor(positionMs)}`,
    accessToken,
    { method: 'PUT' },
  );
}

export async function refreshAccessToken(
  clientId: string,
  refreshToken: string,
): Promise<SpotifyTokens> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
