import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  isActive: boolean;
  fontSize: number;
}

const DOT_SIZE_RATIO = 0.38; // relative to fontSize (matches extension's dot size)
const DOT_GAP_RATIO = 0.18;

// Spring config matching the extension's spring physics (f=2, d=2)
const SPRING_CFG = { damping: 20, stiffness: 200 };
const SPRING_OUT_CFG = { damping: 18, stiffness: 180 };

function AnimatedDot({ isActive, size }: { isActive: boolean; size: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1, SPRING_CFG);
    } else {
      scale.value = withSpring(0, SPRING_OUT_CFG);
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        animStyle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

export function MusicalLine({ isActive, fontSize }: Props) {
  const dotSize = fontSize * DOT_SIZE_RATIO;
  const gap = fontSize * DOT_GAP_RATIO;

  return (
    <View style={[styles.row, { gap }]}>
      <AnimatedDot isActive={isActive} size={dotSize} />
      <AnimatedDot isActive={isActive} size={dotSize} />
      <AnimatedDot isActive={isActive} size={dotSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { backgroundColor: 'rgba(255,255,255,0.85)' },
});
