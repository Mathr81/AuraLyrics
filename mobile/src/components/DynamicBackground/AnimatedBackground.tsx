import { useEffect } from 'react';
import { Image as RNImage, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  imageUrl: string | null;
}

// Extension: warp period ~28s
const WARP = 28_000;
const ease = Easing.inOut(Easing.sin);

export function AnimatedBackground({ imageUrl }: Props) {
  const scale1 = useSharedValue(1.0);
  const tx1    = useSharedValue(0);
  const ty1    = useSharedValue(0);
  const scale2 = useSharedValue(1.06);
  const tx2    = useSharedValue(8);
  const ty2    = useSharedValue(-6);

  useEffect(() => {
    scale1.value = withRepeat(withSequence(
      withTiming(1.10, { duration: WARP, easing: ease }),
      withTiming(1.00, { duration: WARP, easing: ease }),
    ), -1, false);
    tx1.value = withRepeat(withSequence(
      withTiming(14,  { duration: WARP * 0.7, easing: ease }),
      withTiming(-10, { duration: WARP * 0.8, easing: ease }),
      withTiming(0,   { duration: WARP * 0.5, easing: ease }),
    ), -1, false);
    ty1.value = withRepeat(withSequence(
      withTiming(-12, { duration: WARP * 0.9, easing: ease }),
      withTiming(8,   { duration: WARP * 0.6, easing: ease }),
      withTiming(0,   { duration: WARP * 0.5, easing: ease }),
    ), -1, false);
    scale2.value = withRepeat(withSequence(
      withTiming(1.00, { duration: WARP, easing: ease }),
      withTiming(1.08, { duration: WARP, easing: ease }),
    ), -1, false);
    tx2.value = withRepeat(withSequence(
      withTiming(-10, { duration: WARP * 0.8, easing: ease }),
      withTiming(12,  { duration: WARP * 0.7, easing: ease }),
      withTiming(0,   { duration: WARP * 0.5, easing: ease }),
    ), -1, false);
    ty2.value = withRepeat(withSequence(
      withTiming(10,  { duration: WARP * 0.6, easing: ease }),
      withTiming(-8,  { duration: WARP * 0.9, easing: ease }),
      withTiming(0,   { duration: WARP * 0.5, easing: ease }),
    ), -1, false);
  }, []);

  const animStyle1 = useAnimatedStyle(() => ({
    transform: [
      { scale: scale1.value },
      { translateX: tx1.value },
      { translateY: ty1.value },
    ],
  }));
  const animStyle2 = useAnimatedStyle(() => ({
    transform: [
      { scale: scale2.value },
      { translateX: tx2.value },
      { translateY: ty2.value },
    ],
  }));

  if (!imageUrl) {
    return <View style={styles.fallback} />;
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {/*
       * PRIMARY blur — React Native Image blurRadius works on BOTH iOS and Android.
       * Extension: filter saturate(2.5) brightness(0.65).
       * blurRadius=60 gives heavy gaussian blur cross-platform.
       */}
      <RNImage
        source={{ uri: imageUrl }}
        style={styles.baseBlur}
        blurRadius={60}
        resizeMode="cover"
      />

      {/* Animated warp layer 1 — adds depth & color movement */}
      <Animated.View style={[StyleSheet.absoluteFill, animStyle1, styles.warpLayer1]}>
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </Animated.View>

      {/* Animated warp layer 2 — opposite phase */}
      <Animated.View style={[StyleSheet.absoluteFill, animStyle2, styles.warpLayer2]}>
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </Animated.View>

      {/*
       * BlurView: on iOS provides a perfect frosted-glass Gaussian blur over the
       * warp layers. On Android it acts as an additional dark overlay (tint="dark").
       * Combined with blurRadius above, this looks great on both platforms.
       */}
      <BlurView style={StyleSheet.absoluteFill} intensity={85} tint="dark" />

      {/* Extension: rgba(0,0,0,0.38) base dark overlay for brightness reduction */}
      <View style={styles.overlayDark} />

      {/* Bottom gradient: readability for lyrics */}
      <LinearGradient
        style={StyleSheet.absoluteFill}
        colors={['rgba(0,0,0,0.10)', 'rgba(0,0,0,0.60)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0a0a12',
  },

  // Blurred static base (cross-platform)
  baseBlur: {
    ...StyleSheet.absoluteFill,
    // Slight scale to prevent black edges from blur padding
    transform: [{ scale: 1.05 }],
  },

  // Warp layers at low opacity — contribute color, not sharpness
  warpLayer1: { opacity: 0.45 },
  warpLayer2: { opacity: 0.30 },

  // Dark overlay: simulate brightness(0.65) from extension filter
  overlayDark: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
});
