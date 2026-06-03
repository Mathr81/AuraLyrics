import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  isActive: boolean;
  fontSize: number;
}

// Extension: dot resting opacity 0.35, active 1.0
const DOT_OPACITY_REST   = 0.35;
const DOT_OPACITY_ACTIVE = 1.0;

function AnimatedDot({
  isActive,
  size,
  delay,
}: {
  isActive: boolean;
  size: number;
  delay: number;
}) {
  const scale      = useSharedValue(0.75);
  const opacity    = useSharedValue(DOT_OPACITY_REST);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      // Extension: scale 0.75→1.05→1.0, y 0→-0.12→0, opacity 0.35→1
      scale.value = withDelay(
        delay,
        withSequence(
          withTiming(1.05, { duration: 120, easing: Easing.out(Easing.cubic) }),
          withSpring(1.0, { damping: 8, stiffness: 60 }),
        ),
      );
      opacity.value = withDelay(
        delay,
        withTiming(DOT_OPACITY_ACTIVE, { duration: 200 }),
      );
      // Extension Y-offset: 0 → -0.12 (relative to dot size)
      translateY.value = withDelay(
        delay,
        withSequence(
          withTiming(-size * 0.18, { duration: 100, easing: Easing.out(Easing.cubic) }),
          withSpring(0, { damping: 6, stiffness: 60 }),
        ),
      );
    } else {
      // Collapse: no delay on exit (all dots together)
      scale.value      = withSpring(0.75, { damping: 12, stiffness: 100 });
      opacity.value    = withTiming(DOT_OPACITY_REST, { duration: 400 });
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [isActive]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        dotStyle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

export function MusicalLine({ isActive, fontSize }: Props) {
  // Extension: --font-size: DefaultLyricsSize * 1.3, line-height: 0.65 → dot≈fontSize*0.38
  const dotSize = Math.round(fontSize * 0.38);
  // Extension: gap = clamp(0.005rem, 1.7cqw, 0.18rem) ≈ fontSize * 0.17
  const gap = Math.round(fontSize * 0.17);

  return (
    <View style={[styles.row, { gap, paddingVertical: fontSize * 0.18 }]}>
      {/* Staggered cascade: 0ms, 200ms, 400ms — mirrors extension */}
      <AnimatedDot isActive={isActive} size={dotSize} delay={0} />
      <AnimatedDot isActive={isActive} size={dotSize} delay={200} />
      <AnimatedDot isActive={isActive} size={dotSize} delay={400} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { backgroundColor: 'rgba(255,255,255,0.9)' },
});
