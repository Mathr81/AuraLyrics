import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface Props {
  imageUrl: string | null;
}

// Slow ambient warp animation — mimics Kawarp's motion
const WARP_DURATION = 28_000;

export function AnimatedBackground({ imageUrl }: Props) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const easing = Easing.inOut(Easing.sin);
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: WARP_DURATION, easing }),
        withTiming(1.0, { duration: WARP_DURATION, easing }),
      ),
      -1,
      false,
    );
    translateX.value = withRepeat(
      withSequence(
        withTiming(12, { duration: WARP_DURATION * 0.7, easing }),
        withTiming(-8, { duration: WARP_DURATION * 0.8, easing }),
        withTiming(0, { duration: WARP_DURATION * 0.5, easing }),
      ),
      -1,
      false,
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: WARP_DURATION * 0.9, easing }),
        withTiming(6, { duration: WARP_DURATION * 0.6, easing }),
        withTiming(0, { duration: WARP_DURATION * 0.5, easing }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (!imageUrl) {
    return <View style={styles.fallback} />;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={1200}
          cachePolicy="memory-disk"
        />
      </Animated.View>
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={90}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
      />
      {/* Extra darkening overlay for lyric readability */}
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { ...StyleSheet.absoluteFill, backgroundColor: '#0a0a0a' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
});
