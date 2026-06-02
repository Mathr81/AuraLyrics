import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import type { SpotifyPlaybackState } from '../../types/spotify';
import { PlaybackControls } from './PlaybackControls';
import { ProgressBar } from './ProgressBar';

interface Props {
  playback: SpotifyPlaybackState;
  progressMs: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (ms: number) => void;
  isLandscape: boolean;
}

export function NowPlayingBar({
  playback,
  progressMs,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  isLandscape,
}: Props) {
  const track = playback.item;
  if (!track) return null;

  const artworkUrl = track.album.images[0]?.url ?? null;
  const artistNames = track.artists.map((a) => a.name).join(', ');

  if (isLandscape) {
    // ── iPad landscape: full left panel ──────────────────────────────────
    return (
      <View style={styles.panelLandscape}>
        {artworkUrl && (
          <Image
            source={{ uri: artworkUrl }}
            style={styles.artworkLarge}
            contentFit="cover"
            transition={600}
            cachePolicy="memory-disk"
          />
        )}
        <View style={styles.infoBlock}>
          <Text style={styles.trackName} numberOfLines={2}>{track.name}</Text>
          <Text style={styles.artistName} numberOfLines={1}>{artistNames}</Text>
        </View>
        <View style={styles.controlsBlock}>
          <ProgressBar
            progressMs={progressMs}
            durationMs={track.duration_ms}
            onSeek={onSeek}
          />
          <PlaybackControls
            isPlaying={playback.is_playing}
            onPlay={onPlay}
            onPause={onPause}
            onNext={onNext}
            onPrevious={onPrevious}
          />
        </View>
      </View>
    );
  }

  // ── Portrait: bottom overlay bar ─────────────────────────────────────────
  return (
    <BlurView style={styles.barPortrait} intensity={60} tint="dark">
      <View style={styles.barInner}>
        <View style={styles.barLeft}>
          {artworkUrl && (
            <Image
              source={{ uri: artworkUrl }}
              style={styles.artworkSmall}
              contentFit="cover"
              transition={600}
              cachePolicy="memory-disk"
            />
          )}
          <View style={styles.barTextBlock}>
            <Text style={styles.trackNameSmall} numberOfLines={1}>{track.name}</Text>
            <Text style={styles.artistNameSmall} numberOfLines={1}>{artistNames}</Text>
          </View>
        </View>
        <PlaybackControls
          isPlaying={playback.is_playing}
          onPlay={onPlay}
          onPause={onPause}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </View>
      <View style={styles.progressPortrait}>
        <ProgressBar
          progressMs={progressMs}
          durationMs={track.duration_ms}
          onSeek={onSeek}
        />
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  // Landscape panel
  panelLandscape: {
    width: '100%',
    height: '100%',
    padding: 28,
    justifyContent: 'center',
    gap: 24,
  },
  artworkLarge: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowRadius: 24,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 8 },
  },
  infoBlock: { gap: 4 },
  trackName: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  artistName: { color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: '500' },
  controlsBlock: { gap: 16 },

  // Portrait bar
  barPortrait: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  barLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 },
  artworkSmall: { width: 40, height: 40, borderRadius: 6 },
  barTextBlock: { flex: 1 },
  trackNameSmall: { color: '#fff', fontSize: 14, fontWeight: '600' },
  artistNameSmall: { color: 'rgba(255,255,255,0.55)', fontSize: 12 },
  progressPortrait: { paddingHorizontal: 4 },
});
