import { forwardRef, memo, useImperativeHandle } from 'react';
import { StyleSheet, Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

export interface LyricsWordRef {
  setActive(skipped?: boolean): void;
  setSung(): void;
  setNotYet(): void;
}

interface Props {
  text: string;
  fontSize: number;
  isActive: boolean; // is the PARENT LINE active (not this syllable)
}

// Extension values
const OPACITY_NOT_YET = 0.35;
const OPACITY_ACTIVE  = 1.0;
const OPACITY_SUNG    = 0.85;
const SCALE_NOT_YET   = 0.95;
const SCALE_OVERSHOOT = 1.075;
const SCALE_REST      = 1.0;

const SCALE_SPRING = { damping: 5.3, stiffness: 19.3, mass: 1 };
const CUBIC_OUT    = Easing.out(Easing.cubic);
const QUAD_OUT     = Easing.out(Easing.quad);

// Extension gradient stops (top → bottom, 180deg):
// --gradient-alpha: 0.85, --gradient-alpha-end: 0.50
const GRAD_COLORS: [string, string] = [
  'rgba(255,255,255,0.90)',
  'rgba(255,255,255,0.52)',
];

function LyricsWordInner({ text, fontSize, isActive }: Props, ref: React.Ref<LyricsWordRef>) {
  const opacity = useSharedValue(OPACITY_NOT_YET);
  const scale   = useSharedValue(SCALE_NOT_YET);
  const glow    = useSharedValue(0);

  // Imperative API — called by LyricsLine's single useAnimatedReaction via runOnJS
  useImperativeHandle(ref, () => ({
    setActive(skipped = false) {
      if (skipped) {
        // Syllable too short — quick flash then settle to sung
        opacity.value = withSequence(
          withTiming(OPACITY_ACTIVE, { duration: 30 }),
          withTiming(OPACITY_SUNG,   { duration: 120 }),
        );
        glow.value = withSequence(
          withTiming(0.7, { duration: 30 }),
          withTiming(0,   { duration: 120 }),
        );
      } else {
        // Extension: scale 0.95 → 1.075 → 1.0, opacity to 1, glow burst
        opacity.value = withTiming(OPACITY_ACTIVE, { duration: 60 });
        scale.value   = withSequence(
          withTiming(SCALE_OVERSHOOT, { duration: 100, easing: CUBIC_OUT }),
          withSpring(SCALE_REST, SCALE_SPRING),
        );
        glow.value = withTiming(1, { duration: 80 });
      }
    },
    setSung() {
      opacity.value = withTiming(OPACITY_SUNG, { duration: 200 });
      scale.value   = withTiming(SCALE_REST,   { duration: 250, easing: QUAD_OUT });
      glow.value    = withTiming(0,            { duration: 300 });
    },
    setNotYet() {
      opacity.value = withTiming(OPACITY_NOT_YET, { duration: 200 });
      scale.value   = withTiming(SCALE_NOT_YET,   { duration: 200 });
      glow.value    = withTiming(0,               { duration: 150 });
    },
  }), []);

  // Outer wrapper: scale + overall opacity
  const wrapperStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }));

  // Glow on the base text layer (textShadow extends outside letter bounds)
  const glowStyle = useAnimatedStyle(() => ({
    textShadowRadius: interpolate(glow.value, [0, 1], [0, 16]),
  }));

  const baseTextStyle = [
    styles.text,
    { fontSize, lineHeight: fontSize * 1.182 } as const,
  ];

  // ── Non-active line: lightweight plain text ──────────────────────────────
  // No MaskedView — avoids GPU framebuffer per word for non-active lines.
  if (!isActive) {
    return (
      <Animated.Text
        style={[
          baseTextStyle,
          { color: '#fff', marginRight: fontSize * 0.08 },
          wrapperStyle,
        ]}
      >
        {text}
      </Animated.Text>
    );
  }

  // ── Active line: gradient fill (background-clip:text equivalent) + glow ──
  //
  // Stack:
  //   1. Animated.Text (white, defines layout + emits glow via textShadow)
  //   2. MaskedView (absoluteFill): gradient fills the letter-shaped mask
  //
  // Result: gradient shows through letter interiors, glow radiates from edges
  return (
    <Animated.View style={[styles.wrapper, { marginRight: fontSize * 0.08 }, wrapperStyle]}>
      {/*
       * Layer 1 — Glow base:
       * White text with animated textShadow. The shadow extends beyond the letter
       * bounds; the MaskedView on top covers the actual letter area with gradient,
       * leaving only the surrounding glow visible from this layer.
       * Extension: --ActiveTextGlowDef rgba(255,255,255,0.4) 0 0 14px
       */}
      <Animated.Text
        style={[
          baseTextStyle,
          styles.glowText,
          glowStyle,
        ]}
      >
        {text}
      </Animated.Text>

      {/*
       * Layer 2 — Gradient fill (background-clip: text equivalent):
       * MaskedView uses the text as a mask; LinearGradient fills through it.
       * Extension gradient: 180deg, rgba(255,255,255,0.85) → rgba(255,255,255,0.50)
       */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={
          <Text style={[baseTextStyle, styles.maskText]}>{text}</Text>
        }
      >
        <LinearGradient
          colors={GRAD_COLORS}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </MaskedView>
    </Animated.View>
  );
}

export const LyricsWord = memo(forwardRef(LyricsWordInner));

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  text: {
    fontWeight: '700',
    color:      '#fff',
  },
  // Glow base: white text, shadow props animated
  glowText: {
    textShadowColor:  'rgba(255,255,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
    // textShadowRadius animated via glowStyle
  },
  // Mask element: black opaque text so MaskedView uses it as an alpha mask
  maskText: {
    color:   '#000',
    opacity: 1,
  },
});
