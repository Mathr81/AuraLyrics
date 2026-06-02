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
  const barWidth = useRef(0);
  const isDragging = useSharedValue(false);
  const dragPosition = useSharedValue(0);

  const fraction = durationMs > 0 ? Math.min(1, progressMs / durationMs) : 0;
  const displayFraction = isDragging.value ? dragPosition.value : fraction;

  const trackFill = useAnimatedStyle(() => ({
    width: `${(isDragging.value ? dragPosition.value : fraction) * 100}%`,
  }));

  const doSeek = useCallback(
    (x: number) => {
      if (barWidth.current <= 0) return;
      const ratio = Math.max(0, Math.min(1, x / barWidth.current));
      onSeek(ratio * durationMs);
    },
    [durationMs, onSeek],
  );

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      dragPosition.value = Math.max(0, Math.min(1, e.x / barWidth.current));
    })
    .onUpdate((e) => {
      dragPosition.value = Math.max(0, Math.min(1, e.x / barWidth.current));
    })
    .onEnd((e) => {
      isDragging.value = false;
      runOnJS(doSeek)(e.x);
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    runOnJS(doSeek)(e.x);
  });

  const gesture = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View
          style={styles.trackOuter}
          onLayout={(e) => { barWidth.current = e.nativeEvent.layout.width; }}
          hitSlop={{ top: 12, bottom: 12 }}
        >
          <View style={styles.trackBg} />
          <Animated.View style={[styles.trackFill, trackFill]} />
          {/* Thumb dot */}
          <Animated.View
            style={[
              styles.thumb,
              useAnimatedStyle(() => ({
                left: `${(isDragging.value ? dragPosition.value : fraction) * 100}%`,
              })),
            ]}
          />
        </View>
      </GestureDetector>
      <View style={styles.times}>
        <Text style={styles.time}>{formatMs(progressMs)}</Text>
        <Text style={styles.time}>{formatMs(durationMs)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 6 },
  trackOuter: { height: 3, width: '100%', position: 'relative', justifyContent: 'center' },
  trackBg: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  trackFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#fff', borderRadius: 2 },
  thumb: {
    position: 'absolute',
    top: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginLeft: -6,
    marginTop: -6,
  },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '500' },
});
