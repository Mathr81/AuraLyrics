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

  const artworkUrl  = track.album.images[0]?.url ?? null;
  const artistNames = track.artists.map((a) => a.name).join(', ');

  if (isLandscape) {
    // ── iPad landscape: left panel — mirrors extension NowBar layout ─────────
    return (
      <View style={styles.panelLandscape}>
        {artworkUrl && (
          <Image
            source={{ uri: artworkUrl }}
            style={styles.artworkLarge}
            contentFit="cover"
            transition={800}
            cachePolicy="memory-disk"
          />
        )}

        <View style={styles.infoBlock}>
          {/* Extension: font-weight 900, opacity 0.95 for title */}
          <Text style={styles.trackName} numberOfLines={2}>
            {track.name}
          </Text>
          {/* Extension: font-weight 400, opacity 0.70 for artist */}
          <Text style={styles.artistName} numberOfLines={1}>
            {artistNames}
          </Text>
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

  // ── Portrait: bottom overlay with glass blur ─────────────────────────────
  return (
    <BlurView style={styles.barPortrait} intensity={65} tint="dark">
      {/* Extension: inset 0 1px 0 rgba(255,255,255,0.38) — top bevel */}
      <View style={styles.barBorderTop} />
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
            <Text style={styles.trackNameSmall} numberOfLines={1}>
              {track.name}
            </Text>
            <Text style={styles.artistNameSmall} numberOfLines={1}>
              {artistNames}
            </Text>
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
  // ── Landscape panel ───────────────────────────────────────────────────────
  panelLandscape: {
    width: '100%',
    height: '100%',
    padding: 28,
    justifyContent: 'center',
    gap: 20,
  },

  artworkLarge: {
    width: '100%',
    aspectRatio: 1,
    // Extension: border-radius 2cqh — using fixed value
    borderRadius: 14,
    // Extension: box-shadow 0 9px 20px 0 rgba(0,0,0,0.271), opacity 0.95
    shadowColor: '#000',
    shadowRadius: 20,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 9 },
    opacity: 0.95,
  },

  infoBlock: { gap: 3 },

  // Extension: font-weight 900, opacity 0.95
  trackName: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
    opacity: 0.95,
  },

  // Extension: font-weight 400, opacity 0.70
  artistName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
    opacity: 0.70,
  },

  controlsBlock: { gap: 14 },

  // ── Portrait bar ─────────────────────────────────────────────────────────
  barPortrait: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: 0,
  },

  // Extension: inset 0 1px 0 rgba(255,255,255,0.38) — top bevel
  barBorderTop: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.30)',
    marginBottom: 4,
  },

  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },

  barLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },

  // Extension: cover image 44px × 44px, border-radius 6px
  artworkSmall: {
    width: 44,
    height: 44,
    borderRadius: 6,
  },

  barTextBlock: { flex: 1 },

  trackNameSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.95,
  },

  artistNameSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.65,
  },

  progressPortrait: { paddingHorizontal: 2 },
});
