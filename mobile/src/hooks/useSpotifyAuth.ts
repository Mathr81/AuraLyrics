import { useCallback, useEffect, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES } from '../utils/constants';
import { refreshAccessToken } from '../services/spotify';
import type { SpotifyTokens } from '../types/spotify';

// Required: lets expo-web-browser close the auth session when the app reopens
WebBrowser.maybeCompleteAuthSession();

// ─── PKCE helpers ─────────────────────────────────────────────────────────────

function b64urlEncode(s: string) {
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function generatePKCE() {
  const bytes = await Crypto.getRandomBytesAsync(32);
  const verifier = b64urlEncode(btoa(String.fromCharCode(...new Uint8Array(bytes))));
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return { verifier, challenge: b64urlEncode(hash) };
}

function buildAuthUrl(challenge: string) {
  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.set('client_id', SPOTIFY_CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', SPOTIFY_REDIRECT_URI);
  url.searchParams.set('scope', SPOTIFY_SCOPES);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('state', Math.random().toString(36).slice(2));
  return url.toString();
}

// ─── Token storage ─────────────────────────────────────────────────────────────

const TOKENS_KEY = 'spotify_tokens_v2';

async function loadTokens(): Promise<SpotifyTokens | null> {
  const raw = await SecureStore.getItemAsync(TOKENS_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
async function saveTokens(t: SpotifyTokens) {
  await SecureStore.setItemAsync(TOKENS_KEY, JSON.stringify(t));
}
async function deleteTokens() {
  await SecureStore.deleteItemAsync(TOKENS_KEY);
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSpotifyAuth() {
  const [tokens, setTokens] = useState<SpotifyTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const pkceRef = useRef<string | null>(null);

  // Load persisted tokens on mount, refresh if near-expiry
  useEffect(() => {
    (async () => {
      const stored = await loadTokens();
      if (stored) {
        if (Date.now() > stored.expiresAt - 60_000) {
          try {
            const refreshed = await refreshAccessToken(SPOTIFY_CLIENT_ID, stored.refreshToken);
            await saveTokens(refreshed);
            setTokens(refreshed);
          } catch {
            await deleteTokens();
          }
        } else {
          setTokens(stored);
        }
      }
      setLoading(false);
    })();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  // Uses expo-web-browser.openAuthSessionAsync which calls ASWebAuthenticationSession
  // on iOS — it intercepts the auralyrics:// redirect at the OS level, so it
  // works in Expo Go WITHOUT the scheme being registered in the app.
  const login = useCallback(async () => {
    const { verifier, challenge } = await generatePKCE();
    pkceRef.current = verifier;

    const result = await WebBrowser.openAuthSessionAsync(
      buildAuthUrl(challenge),
      SPOTIFY_REDIRECT_URI,
    );

    if (result.type !== 'success') {
      pkceRef.current = null;
      return;
    }

    const code = new URL(result.url).searchParams.get('code');
    if (!code || !pkceRef.current) return;

    const verifierUsed = pkceRef.current;
    pkceRef.current = null;

    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: SPOTIFY_REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: verifierUsed,
        }).toString(),
      });
      const data = await res.json();
      const newTokens: SpotifyTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
      await saveTokens(newTokens);
      setTokens(newTokens);
    } catch (e) {
      console.error('Token exchange failed', e);
    }
  }, []);

  const logout = useCallback(async () => {
    await deleteTokens();
    setTokens(null);
  }, []);

  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!tokens) return null;
    if (Date.now() < tokens.expiresAt - 60_000) return tokens.accessToken;
    try {
      const refreshed = await refreshAccessToken(SPOTIFY_CLIENT_ID, tokens.refreshToken);
      await saveTokens(refreshed);
      setTokens(refreshed);
      return refreshed.accessToken;
    } catch {
      await deleteTokens();
      setTokens(null);
      return null;
    }
  }, [tokens]);

  return { isAuthenticated: !!tokens, loading, login, logout, getValidToken };
}
