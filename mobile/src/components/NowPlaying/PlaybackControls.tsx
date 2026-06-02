import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PlaybackControls({ isPlaying, onPlay, onPause, onNext, onPrevious }: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onPrevious} hitSlop={12} activeOpacity={0.6}>
        <Ionicons name="play-skip-back" size={26} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={isPlaying ? onPause : onPlay}
        style={styles.playBtn}
        activeOpacity={0.75}
      >
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={28}
          color="#fff"
          style={isPlaying ? undefined : { marginLeft: 3 }}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext} hitSlop={12} activeOpacity={0.6}>
        <Ionicons name="play-skip-forward" size={26} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
