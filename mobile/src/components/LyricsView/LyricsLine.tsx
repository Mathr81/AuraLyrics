import { memo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { SyncedLine } from '../../hooks/useLyricsSync';
import { LyricsWord } from './LyricsWord';
import { MusicalLine } from './MusicalLine';

interface Props {
  line: SyncedLine;
  fontSize: number;
  progressSec: number; // passed only for active line, 0 for others
  lyricsType: 'Syllable' | 'Line' | 'Static';
}

// Values mirroring the extension's CSS
const OPACITY_ACTIVE = 1;
const OPACITY_SUNG = 0.497;
const OPACITY_NOT_SUNG = 0.51;
const SCALE_ACTIVE = 1.05;
const SCALE_DEFAULT = 1;

const TRANSITION = { duration: 200, easing: Easing.bezier(0.37, 0, 0.63, 1) };

function LyricsLineInner({ line, fontSize, progressSec, lyricsType }: Props) {
  const opacity = useSharedValue(OPACITY_NOT_SUNG);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (line.state === 'Active') {
      opacity.value = withTiming(OPACITY_ACTIVE, TRANSITION);
      scale.value = withTiming(lyricsType === 'Line' ? SCALE_ACTIVE : SCALE_DEFAULT, TRANSITION);
    } else if (line.state === 'Sung') {
      opacity.value = withTiming(OPACITY_SUNG, TRANSITION);
      scale.value = withTiming(SCALE_DEFAULT, TRANSITION);
    } else {
      opacity.value = withTiming(OPACITY_NOT_SUNG, TRANSITION);
      scale.value = withTiming(SCALE_DEFAULT, TRANSITION);
    }
  }, [line.state, lyricsType]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const isActive = line.state === 'Active';
  const isOppositeAligned = line.OppositeAligned ?? false;

  // ── Musical line (instrumental dots) ─────────────────────────────────────
  if (line.IsDotLine) {
    return (
      <Animated.View style={[styles.lineBase, styles.musicalLine, animStyle]}>
        <MusicalLine isActive={isActive} fontSize={fontSize} />
      </Animated.View>
    );
  }

  // ── Syllable-level line (word by word) ───────────────────────────────────
  const syllables = line.Lead ?? line.Syllables?.Lead;
  if (lyricsType === 'Syllable' && syllables && syllables.length > 0) {
    return (
      <Animated.View
        style={[
          styles.lineBase,
          isOppositeAligned ? styles.rightAligned : styles.leftAligned,
          animStyle,
        ]}
      >
        <View style={styles.wordRow}>
          {syllables.map((syllable, i) => (
            <LyricsWord
              key={i}
              text={syllable.Text}
              startTime={syllable.StartTime}
              endTime={syllable.EndTime}
              progressSec={progressSec}
              fontSize={fontSize}
              isInActiveLine={isActive}
            />
          ))}
        </View>
      </Animated.View>
    );
  }

  // ── Line-level or Static ─────────────────────────────────────────────────
  const text = line.Text ?? '';
  return (
    <Animated.View
      style={[
        styles.lineBase,
        isOppositeAligned ? styles.rightAligned : styles.leftAligned,
        animStyle,
      ]}
    >
      <Animated.Text
        style={[
          styles.lineText,
          { fontSize },
          isActive && styles.activeGlow,
        ]}
      >
        {text}
      </Animated.Text>
    </Animated.View>
  );
}

export const LyricsLine = memo(LyricsLineInner);

const styles = StyleSheet.create({
  lineBase: {
    marginVertical: 4,
    paddingHorizontal: 4,
  },
  leftAligned: { alignSelf: 'flex-start' },
  rightAligned: { alignSelf: 'flex-end' },
  musicalLine: { alignSelf: 'flex-start', minHeight: 32 },
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  lineText: {
    fontWeight: '700',
    color: '#fff',
    lineHeight: undefined,
  },
  activeGlow: {
    textShadowColor: 'rgba(255,255,255,0.35)',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
});
