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
  setActive(skipped?: boolean, durationMs?: number): void;
  setSung(): void;
  setNotYet(): void;
}

interface Props {
  text: string;
  fontSize: number;
  isActive: boolean; // is the PARENT LINE active (not this syllable)
}

const OPACITY_NOT_YET = 0.35;
const OPACITY_ACTIVE  = 1.0;
const OPACITY_SUNG    = 0.85;
const SCALE_NOT_YET   = 0.95;
const SCALE_OVERSHOOT = 1.075;
const SCALE_REST      = 1.0;

const SCALE_SPRING = { damping: 5.3, stiffness: 19.3, mass: 1 };
const CUBIC_OUT    = Easing.out(Easing.cubic);
const QUAD_OUT     = Easing.out(Easing.quad);

// Extension gradient: 180deg top→bottom
// BRIGHT top half (alpha 0.85) → DIM bottom half (alpha 0.35)
// The gradient container is 2× lineHeight tall; translateY animates from
// -lineHeight (shows DIM bottom) → 0 (shows BRIGHT top) as gradientFill 0→1
const GRAD_BRIGHT = 'rgba(255,255,255,0.90)';
const GRAD_DIM    = 'rgba(255,255,255,0.35)';
const GRAD_COLORS: [string, string, string, string] = [
  GRAD_BRIGHT, GRAD_BRIGHT, GRAD_DIM, GRAD_DIM,
];
const GRAD_LOCATIONS: [number, number, number, number] = [0, 0.48, 0.52, 1];

function LyricsWordInner({ text, fontSize, isActive }: Props, ref: React.Ref<LyricsWordRef>) {
  const opacity      = useSharedValue(OPACITY_NOT_YET);
  const scale        = useSharedValue(SCALE_NOT_YET);
  const glow         = useSharedValue(0);
  // gradientFill: 0 = show DIM (not sung), 1 = show BRIGHT (sung)
  // Driven by setActive(duration) for smooth per-syllable fill animation
  const gradientFill = useSharedValue(0);

  const LINE_H = fontSize * 1.182;

  useImperativeHandle(ref, () => ({
    setActive(skipped = false, durationMs = 200) {
      if (skipped) {
        opacity.value = withSequence(
          withTiming(OPACITY_ACTIVE, { duration: 30 }),
          withTiming(OPACITY_SUNG,   { duration: 120 }),
        );
        glow.value = withSequence(
          withTiming(0.7, { duration: 30 }),
          withTiming(0,   { duration: 120 }),
        );
        gradientFill.value = withSequence(
          withTiming(1,    { duration: 30 }),
          withTiming(0.85, { duration: 120 }),
        );
      } else {
        opacity.value = withTiming(OPACITY_ACTIVE, { duration: 60 });
        scale.value   = withSequence(
          withTiming(SCALE_OVERSHOOT, { duration: 100, easing: CUBIC_OUT }),
          withSpring(SCALE_REST, SCALE_SPRING),
        );
        glow.value = withTiming(1, { duration: 80 });
        // Animate gradient fill over the syllable's duration (linear, like the extension)
        gradientFill.value = withTiming(1.0, {
          duration: Math.max(50, durationMs),
          easing: Easing.linear,
        });
      }
    },
    setSung() {
      opacity.value      = withTiming(OPACITY_SUNG, { duration: 200 });
      scale.value        = withTiming(SCALE_REST,   { duration: 250, easing: QUAD_OUT });
      glow.value         = withTiming(0,            { duration: 300 });
      gradientFill.value = withTiming(1,            { duration: 150 }); // stay bright
    },
    setNotYet() {
      opacity.value      = withTiming(OPACITY_NOT_YET, { duration: 200 });
      scale.value        = withTiming(SCALE_NOT_YET,   { duration: 200 });
      glow.value         = withTiming(0,               { duration: 150 });
      gradientFill.value = withTiming(0,               { duration: 200 }); // back to dim
    },
  }), []);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    textShadowRadius: interpolate(glow.value, [0, 1], [0, 16]),
  }));

  // Gradient container translateY: -LINE_H (dim) → 0 (bright) as gradientFill 0→1
  const gradientTranslateStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: LINE_H * (gradientFill.value - 1) }],
  }));

  const baseTextStyle = [
    styles.text,
    { fontSize, lineHeight: LINE_H } as const,
  ];

  // ── Non-active line: lightweight plain text ──────────────────────────────
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
  //   1. Animated.Text (white) — defines layout + emits glow via textShadow
  //   2. MaskedView (absoluteFill): animated gradient fills letter shapes
  //
  // Gradient container (2× LINE_H tall):
  //   top half → BRIGHT (rgba 0.90) — shown when gradientFill = 1
  //   bottom half → DIM  (rgba 0.35) — shown when gradientFill = 0
  // translateY = LINE_H * (gradientFill - 1):
  //   at 0 → translateY = -LINE_H → bottom half (DIM) visible
  //   at 1 → translateY = 0      → top half (BRIGHT) visible
  return (
    <Animated.View style={[styles.wrapper, { marginRight: fontSize * 0.08 }, wrapperStyle]}>
      {/* Layer 1: glow base */}
      <Animated.Text style={[baseTextStyle, styles.glowText, glowStyle]}>
        {text}
      </Animated.Text>

      {/* Layer 2: gradient fill through letter shapes */}
      <MaskedView
        style={StyleSheet.absoluteFill}
        maskElement={<Text style={[baseTextStyle, styles.maskText]}>{text}</Text>}
      >
        <Animated.View
          style={[
            { width: '100%', height: LINE_H * 2, position: 'absolute', top: 0 },
            gradientTranslateStyle,
          ]}
        >
          <LinearGradient
            colors={GRAD_COLORS}
            locations={GRAD_LOCATIONS}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>
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
  glowText: {
    textShadowColor:  'rgba(255,255,255,0.45)',
    textShadowOffset: { width: 0, height: 0 },
  },
  maskText: {
    color:   '#000',
    opacity: 1,
  },
});
