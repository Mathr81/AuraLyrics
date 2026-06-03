import { useCallback, useEffect, useRef, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { SPOTIFY_CLIENT_ID, SPOTIFY_SCOPES } from "../utils/constants";
import { refreshAccessToken } from "../services/spotify";
import type { SpotifyTokens } from "../types/spotify";

WebBrowser.maybeCompleteAuthSession();

// In Expo Go: exp://192.168.x.x:8081/--/auth/callback
// In standalone IPA: auralyrics://auth/callback
const REDIRECT_URI = AuthSession.makeRedirectUri({
  scheme: "auralyrics",
  path: "auth/callback",
});
console.log("[AuraLyrics] Redirect URI:", REDIRECT_URI);

// ─── PKCE helpers ─────────────────────────────────────────────────────────────

function b64urlEncode(s: string) {
  return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function generatePKCE() {
  // verifier: 64 hex chars — unreserved chars, valid per PKCE spec
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  const verifier = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // challenge: SHA256 via HEX → bytes → base64url (avoids BASE64 encoding variance)
  const hexDigest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.HEX },
  );
  const challengeBytes = (hexDigest.match(/.{2}/g) ?? []).map((h) =>
    parseInt(h, 16),
  );
  const challenge = b64urlEncode(btoa(String.fromCharCode(...challengeBytes)));

  return { verifier, challenge };
}

function buildAuthUrl(challenge: string) {
  const url = new URL("https://accounts.spotify.com/authorize");
  url.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("scope", SPOTIFY_SCOPES);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("state", Math.random().toString(36).slice(2));
  return url.toString();
}

// ─── Token exchange with retry ─────────────────────────────────────────────────

async function exchangeCode(
  code: string,
  verifier: string,
): Promise<SpotifyTokens> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Brief delay on retries to let network settle after Custom Tab closes
      if (attempt > 1) await new Promise((r) => setTimeout(r, attempt * 500));

      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          client_id: SPOTIFY_CLIENT_ID,
          code_verifier: verifier,
        }).toString(),
      });
      const data = await res.json();
      if (!data.access_token)
        throw new Error(`Spotify error: ${JSON.stringify(data)}`);
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };
    } catch (e) {
      console.warn(
        `[AuraLyrics] Token exchange attempt ${attempt}/3 failed:`,
        e,
      );
      if (attempt === 3) throw e;
    }
  }
  throw new Error("Token exchange failed after 3 attempts");
}

// ─── Token storage ─────────────────────────────────────────────────────────────

const TOKENS_KEY = "spotify_tokens_v2";

async function loadTokens(): Promise<SpotifyTokens | null> {
  const raw = await SecureStore.getItemAsync(TOKENS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
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

  useEffect(() => {
    (async () => {
      const stored = await loadTokens();
      if (stored) {
        if (Date.now() > stored.expiresAt - 60_000) {
          try {
            const refreshed = await refreshAccessToken(
              SPOTIFY_CLIENT_ID,
              stored.refreshToken,
            );
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

  const login = useCallback(async () => {
    const { verifier, challenge } = await generatePKCE();
    pkceRef.current = verifier;

    const result = await WebBrowser.openAuthSessionAsync(
      buildAuthUrl(challenge),
      REDIRECT_URI,
    );

    console.log("[AuraLyrics] Auth result type:", result.type);

    if (result.type !== "success") {
      pkceRef.current = null;
      return;
    }

    const code = new URL(result.url).searchParams.get("code");
    const verifierUsed = pkceRef.current;
    pkceRef.current = null;

    if (!code || !verifierUsed) return;

    try {
      const newTokens = await exchangeCode(code, verifierUsed);
      await saveTokens(newTokens);
      setTokens(newTokens);
    } catch (e) {
      console.error("[AuraLyrics] Token exchange failed:", e);
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
      const refreshed = await refreshAccessToken(
        SPOTIFY_CLIENT_ID,
        tokens.refreshToken,
      );
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
