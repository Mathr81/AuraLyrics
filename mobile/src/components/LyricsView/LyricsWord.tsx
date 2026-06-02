import { useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  text: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  progressSec: number;
  fontSize: number;
  isInActiveLine: boolean;
}

// Opacity values matching the extension's gradient alpha stops
const OPACITY_NOT_YET = 0.35;
const OPACITY_ACTIVE = 1.0;
const OPACITY_SUNG = 0.85;

export function LyricsWord({ text, startTime, endTime, progressSec, fontSize, isInActiveLine }: Props) {
  const isBeingSung = isInActiveLine && progressSec >= startTime && progressSec < endTime;
  const isAlreadySung = isInActiveLine && progressSec >= endTime;

  const opacity = useSharedValue(OPACITY_NOT_YET);
  const shadowOpacity = useSharedValue(0);

  const targetOpacity = useMemo(() => {
    if (!isInActiveLine) return OPACITY_NOT_YET;
    if (isBeingSung) return OPACITY_ACTIVE;
    if (isAlreadySung) return OPACITY_SUNG;
    return OPACITY_NOT_YET;
  }, [isInActiveLine, isBeingSung, isAlreadySung]);

  useEffect(() => {
    const duration = isBeingSung ? 60 : 180;
    opacity.value = withTiming(targetOpacity, {
      duration,
      easing: Easing.out(Easing.quad),
    });
    shadowOpacity.value = withTiming(isBeingSung ? 0.55 : isAlreadySung ? 0.3 : 0, {
      duration: 120,
    });
  }, [targetOpacity, isBeingSung, isAlreadySung]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    textShadowColor: `rgba(255,255,255,${shadowOpacity.value})`,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  }));

  return (
    <Animated.Text style={[{ fontSize, fontWeight: '700', color: '#fff' }, animStyle]}>
      {text}
    </Animated.Text>
  );
}
