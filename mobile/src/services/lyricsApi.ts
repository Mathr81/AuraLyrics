import type { LyricsData } from "../types/lyrics";
import { getSpotifyInternalToken } from "./spotifyInternalToken";

// ── SLObjPack unpack ───────────────────────────────────────────────────────────
type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };

function slUnpack(packed: unknown): JSONValue {
  if (!Array.isArray(packed) || packed.length !== 2)
    throw new Error("SLObjPack: invalid");
  const valuesList = packed[0] as JSONPrimitive[];
  const stream = packed[1] as number[];
  const streamLen = stream.length;
  let cursor = 0;
  const read = () => stream[cursor++];
  const ptr = (p: unknown) => valuesList[p as number];
  const key = (): string => {
    const k = ptr(read());
    if (typeof k !== "string") throw new Error("key");
    return k;
  };

  function decode(): JSONValue {
    if (cursor >= streamLen) throw new Error("EOF");
    const op = read();
    if (op >= 0) return ptr(op);
    switch (op) {
      case -1: {
        const n = read() as number;
        const keys = Array.from({ length: n }, key);
        const obj: Record<string, JSONValue> = {};
        for (const k of keys) obj[k] = decode();
        return obj;
      }
      case -2: {
        const n = read() as number;
        return Array.from({ length: n }, decode);
      }
      case -3: {
        const n = read() as number;
        const nk = read() as number;
        const keys = Array.from({ length: nk }, key);
        return Array.from({ length: n }, () => {
          const o: Record<string, JSONValue> = {};
          for (const k of keys) o[k] = decode();
          return o;
        });
      }
      case -4:
        return [];
      case -5:
        return [decode()];
      case -6:
        return {};
      default:
        throw new Error(`opcode ${op}`);
    }
  }
  return decode();
}

// ── SpicyLyrics API ────────────────────────────────────────────────────────────

const CLIENT_VERSION = "6.0.0";

async function querySpicyLyrics(
  trackId: string,
  token: string,
): Promise<LyricsData | null> {
  const res = await fetch("https://api.spicylyrics.org/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "SpicyLyrics-Version": CLIENT_VERSION,
      "SpicyLyrics-WebAuth": `Bearer ${token}`,
      "Referer": "https://xpui.app.spotify.com/",
      "Origin": "https://xpui.app.spotify.com",
    },
    body: JSON.stringify({
      queries: [
        {
          operation: "lyrics",
          variables: { id: trackId, auth: "SpicyLyrics-WebAuth" },
        },
      ],
      client: { version: CLIENT_VERSION },
    }),
  });

  if (!res.ok) {
    console.warn("[Lyrics] SpicyLyrics HTTP:", res.status);
    return null;
  }

  const json = await res.json();
  const queryResult = (json?.queries ?? []).find(
    (q: any) => q.operationId === "0",
  );
  const result = queryResult?.result;
  if (!result) return null;

  const raw = slUnpack(result.data) as any;
  const lines = raw.Lines ?? raw.Content ?? [];
  console.log(
    "[Lyrics] Unpacked — Type:", raw.Type,
    "| top-level keys:", Object.keys(raw).join(", "),
    "| lines:", lines.length,
  );
  // Normalize each line:
  // - Lead: API returns Lead = { Syllables: [{Text, StartTime, EndTime}, ...] }
  //         Flatten to a direct array for LyricsLine consumption.
  // - StartTime/EndTime: Syllable-type lines have NO line-level timing —
  //         derive from first/last syllable so useLyricsSync can detect active lines.
  // - IsDotLine: detect from line.Type === 'musical' if not explicit.
  const normalizedLines = (lines as any[]).map((l: any) => {
    const syllables: any[] | undefined =
      l.Lead?.Syllables
      ?? l.Lead?.syllables
      ?? (Array.isArray(l.Lead) ? l.Lead : undefined)
      ?? l.lead?.Syllables
      ?? l.Syllables?.Lead
      ?? l.syllables?.Lead;

    const derivedStart = l.StartTime
      ?? syllables?.[0]?.StartTime
      ?? 0;
    const derivedEnd   = l.EndTime
      ?? syllables?.[syllables.length - 1]?.EndTime
      ?? 0;
    const isDotLine    = l.IsDotLine
      ?? l.isDotLine
      ?? (l.Type === 'musical' || l.Type === 'interlude');

    return {
      ...l,
      Lead: syllables,
      StartTime: derivedStart,
      EndTime:   derivedEnd,
      IsDotLine: isDotLine,
    };
  });
  return { ...raw, Content: normalizedLines } as LyricsData;
}

// ── Main export ────────────────────────────────────────────────────────────────

export async function fetchLyricsFromApi(
  trackId: string,
  oauthToken: string,
): Promise<LyricsData | null> {
  // 1. Try with the internal Spotify token (sp_dc) — gives synced lyrics
  const internalToken = await getSpotifyInternalToken();
  if (internalToken) {
    try {
      const data = await querySpicyLyrics(trackId, internalToken);
      if (data) {
        console.log(
          "[Lyrics] SpicyLyrics (internal token):",
          data.Type,
          data.Content.length,
          "lines",
        );
        return data;
      }
    } catch (e) {
      console.warn("[Lyrics] SpicyLyrics internal token error:", e);
    }
  }

  // 2. Fallback: standard OAuth token (will likely return Static)
  try {
    const data = await querySpicyLyrics(trackId, oauthToken);
    if (data) {
      console.log(
        "[Lyrics] SpicyLyrics (oauth token):",
        data.Type,
        data.Content.length,
        "lines",
      );
      return data;
    }
  } catch (e) {
    console.error("[Lyrics] SpicyLyrics oauth error:", e);
  }

  return null;
}
