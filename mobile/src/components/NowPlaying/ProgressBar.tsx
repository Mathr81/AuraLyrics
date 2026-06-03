import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  progressMs: number;
  durationMs: number;
  onSeek: (positionMs: number) => void;
}

function formatMs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ProgressBar({ progressMs, durationMs, onSeek }: Props) {
  const barWidth   = useRef(0);
  const isDragging = useSharedValue(false);
  const dragPos    = useSharedValue(0);

  const fraction = durationMs > 0 ? Math.min(1, progressMs / durationMs) : 0;

  const trackFill = useAnimatedStyle(() => ({
    width: `${(isDragging.value ? dragPos.value : fraction) * 100}%`,
  }));

  const thumbPos = useAnimatedStyle(() => ({
    left: `${(isDragging.value ? dragPos.value : fraction) * 100}%`,
  }));

  const doSeek = useCallback(
    (x: number) => {
      if (barWidth.current <= 0) return;
      onSeek(Math.max(0, Math.min(1, x / barWidth.current)) * durationMs);
    },
    [durationMs, onSeek],
  );

  const pan = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      dragPos.value = Math.max(0, Math.min(1, e.x / barWidth.current));
    })
    .onUpdate((e) => {
      dragPos.value = Math.max(0, Math.min(1, e.x / barWidth.current));
    })
    .onEnd((e) => {
      isDragging.value = false;
      runOnJS(doSeek)(e.x);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    runOnJS(doSeek)(e.x);
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Simultaneous(pan, tap)}>
        <View
          style={styles.trackOuter}
          onLayout={(e) => { barWidth.current = e.nativeEvent.layout.width; }}
          hitSlop={{ top: 14, bottom: 14 }}
        >
          {/* Extension: RemainingColor = rgba(255,255,255,0.18) */}
          <View style={styles.trackBg} />
          {/* Extension: TraveledColor = #fff (accent) */}
          <Animated.View style={[styles.trackFill, trackFill]} />
          {/* Extension: thumb 185cqh circle — using fixed 13px */}
          <Animated.View style={[styles.thumb, thumbPos]} />
        </View>
      </GestureDetector>

      {/* Times */}
      <View style={styles.times}>
        <Text style={styles.time}>{formatMs(progressMs)}</Text>
        <Text style={styles.time}>{formatMs(durationMs)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 5 },

  // Extension: height 1.3cqh, border-radius 100cqw (pill)
  trackOuter: {
    height: 4,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },

  trackBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
  },

  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 999,
  },

  thumb: {
    position: 'absolute',
    top: '50%',
    width: 13,
    height: 13,
    borderRadius: 999,
    backgroundColor: '#fff',
    marginLeft: -6.5,
    marginTop: -6.5,
    // Extension: thumb shadow
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 1 },
  },

  times: { flexDirection: 'row', justifyContent: 'space-between' },

  // Extension: color text-secondary, ~11px
  time: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '500',
  },
});
