import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
}: Props) {
  return (
    // Extension ViewControls: glass morphism container with liquid-edge borders
    <BlurView style={styles.glassContainer} intensity={40} tint="dark">
      {/* Extension: inset 0 1px 0 rgba(255,255,255,0.36) — top bevel */}
      <View style={styles.topBevel} />

      <View style={styles.row}>
        <TouchableOpacity
          onPress={onPrevious}
          style={styles.btn}
          hitSlop={8}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-back" size={24} color="rgba(255,255,255,0.92)" />
        </TouchableOpacity>

        {/* Extension play button: slightly wider than skip buttons */}
        <TouchableOpacity
          onPress={isPlaying ? onPause : onPlay}
          style={[styles.btn, styles.playBtn]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={26}
            color="#fff"
            style={isPlaying ? undefined : { marginLeft: 3 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          style={styles.btn}
          hitSlop={8}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-forward" size={24} color="rgba(255,255,255,0.92)" />
        </TouchableOpacity>
      </View>

      {/* Extension: inset 0 -1px 0 rgba(255,255,255,0.18) — bottom bevel */}
      <View style={styles.bottomBevel} />
    </BlurView>
  );
}

const styles = StyleSheet.create({
  // Extension material-regular glass: rgba(0,0,0,0.10) + blur(12px)
  // + inset borders (liquid-edge)
  glassContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    // Extension: box-shadow 0 10px 24px -8px rgba(8,10,18,0.42)
    shadowColor: 'rgba(8,10,18,1)',
    shadowRadius: 24,
    shadowOpacity: 0.42,
    shadowOffset: { width: 0, height: 10 },
  },

  // Top bevel: inset 0 1px 0 rgba(255,255,255,0.36)
  topBevel: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.36)',
  },

  // Bottom bevel: inset 0 -1px 0 rgba(255,255,255,0.18)
  bottomBevel: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  playBtn: {
    paddingHorizontal: 22,
  },
});
