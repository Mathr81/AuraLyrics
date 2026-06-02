import { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCurrentTrack } from '../hooks/useCurrentTrack';
import { useLyrics } from '../hooks/useLyrics';
import { useLyricsSync } from '../hooks/useLyricsSync';
import { AnimatedBackground } from '../components/DynamicBackground/AnimatedBackground';
import { LyricsContainer } from '../components/LyricsView/LyricsContainer';
import { NowPlayingBar } from '../components/NowPlaying/NowPlayingBar';
import { play, pause, skipNext, skipPrevious, seek } from '../services/spotify';
import type { SpotifyPlaybackState } from '../types/spotify';

interface Props {
  getValidToken: () => Promise<string | null>;
  onLogout: () => void;
}

function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(
    () => Dimensions.get('window').width > Dimensions.get('window').height,
  );
  Dimensions.addEventListener('change', ({ window }) => {
    setIsLandscape(window.width > window.height);
  });
  return isLandscape;
}

export default function LyricsScreen({ getValidToken, onLogout }: Props) {
  const isLandscape = useOrientation();
  const { playback, progressMs } = useCurrentTrack(getValidToken);
  const trackId = playback?.item?.id ?? null;
  const { lyrics, status } = useLyrics(trackId, getValidToken);
  const { lines, activeIndex } = useLyricsSync(lyrics, progressMs);

  const artworkUrl =
    playback?.item?.album?.images?.[0]?.url ?? null;

  // ── Playback actions ──────────────────────────────────────────────────────
  const handlePlay = useCallback(async () => {
    const token = await getValidToken();
    if (token) play(token).catch(() => {});
  }, [getValidToken]);

  const handlePause = useCallback(async () => {
    const token = await getValidToken();
    if (token) pause(token).catch(() => {});
  }, [getValidToken]);

  const handleNext = useCallback(async () => {
    const token = await getValidToken();
    if (token) skipNext(token).catch(() => {});
  }, [getValidToken]);

  const handlePrevious = useCallback(async () => {
    const token = await getValidToken();
    if (token) skipPrevious(token).catch(() => {});
  }, [getValidToken]);

  const handleSeek = useCallback(async (ms: number) => {
    const token = await getValidToken();
    if (token) seek(token, ms).catch(() => {});
  }, [getValidToken]);

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar style="light" hidden />

      {/* Dynamic blurred background */}
      <AnimatedBackground imageUrl={artworkUrl} />

      {isLandscape ? (
        // ── iPad landscape: split layout ────────────────────────────────
        <View style={styles.splitRow}>
          <View style={styles.leftPanel}>
            {playback && (
              <NowPlayingBar
                playback={playback as SpotifyPlaybackState}
                progressMs={progressMs}
                onPlay={handlePlay}
                onPause={handlePause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSeek={handleSeek}
                isLandscape
              />
            )}
          </View>
          <View style={styles.rightPanel}>
            <LyricsContainer
              lines={lines}
              activeIndex={activeIndex}
              progressSec={progressMs / 1000}
              lyricsType={lyrics?.Type ?? 'Static'}
            />
          </View>
        </View>
      ) : (
        // ── Portrait: full screen lyrics + bottom bar ────────────────────
        <>
          <View style={styles.lyricsPortrait}>
            <LyricsContainer
              lines={lines}
              activeIndex={activeIndex}
              progressSec={progressMs / 1000}
              lyricsType={lyrics?.Type ?? 'Static'}
            />
          </View>
          {playback && (
            <NowPlayingBar
              playback={playback as SpotifyPlaybackState}
              progressMs={progressMs}
              onPlay={handlePlay}
              onPause={handlePause}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onSeek={handleSeek}
              isLandscape={false}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  // Landscape split
  splitRow: { flex: 1, flexDirection: 'row' },
  leftPanel: { width: '33%', borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: 'rgba(255,255,255,0.08)' },
  rightPanel: { flex: 1 },

  // Portrait
  lyricsPortrait: { flex: 1, paddingBottom: 130 /* NowPlayingBar height */ },
});
