import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withSpring,
  runOnJS,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import type { SyncedLine } from '../../hooks/useLyricsSync';
import { LyricsWord, type LyricsWordRef } from './LyricsWord';
import { MusicalLine } from './MusicalLine';

interface Props {
  line: SyncedLine;
  fontSize: number;
  progressShared: SharedValue<number>;
  lyricsType: 'Syllable' | 'Line' | 'Static';
  distanceFromActive: number;
}

const OPACITY_ACTIVE   = 1.0;
const OPACITY_SUNG     = 0.497;
const OPACITY_NOT_SUNG = 0.51;
const SCALE_ACTIVE     = 1.05;
const SCALE_EASING     = Easing.bezier(0.37, 0, 0.63, 1);
const TRANSITION_MS    = 400;

export const LINE_MARGIN_V = 2;

function LyricsLineInner({ line, fontSize, progressShared, lyricsType, distanceFromActive }: Props) {
  const opacity    = useSharedValue(OPACITY_NOT_SUNG);
  const scale      = useSharedValue(1);
  const dotHeight  = useSharedValue(0);
  const barOpacity = useSharedValue(0);
  const barScaleY  = useSharedValue(0);

  const isActive = line.state === 'Active';

  // Line-level opacity/scale transition (runs once on state change)
  useEffect(() => {
    if (lyricsType === 'Static') return;
    if (line.state === 'Active') {
      opacity.value    = withTiming(OPACITY_ACTIVE, { duration: TRANSITION_MS });
      barOpacity.value = withTiming(1, { duration: 200 });
      barScaleY.value  = withSpring(1, { damping: 12, stiffness: 180 });
      if (lyricsType === 'Line') {
        scale.value = withTiming(SCALE_ACTIVE, { duration: TRANSITION_MS, easing: SCALE_EASING });
      }
    } else if (line.state === 'Sung') {
      opacity.value    = withTiming(OPACITY_SUNG, { duration: TRANSITION_MS });
      scale.value      = withTiming(1, { duration: TRANSITION_MS, easing: SCALE_EASING });
      barOpacity.value = withTiming(0, { duration: 200 });
      barScaleY.value  = withTiming(0, { duration: 200 });
    } else {
      opacity.value    = withTiming(OPACITY_NOT_SUNG, { duration: TRANSITION_MS });
      scale.value      = withTiming(1, { duration: TRANSITION_MS, easing: SCALE_EASING });
      barOpacity.value = withTiming(0, { duration: 200 });
      barScaleY.value  = withTiming(0, { duration: 200 });
    }
  }, [line.state, lyricsType]);

  // Musical-line height animation
  useEffect(() => {
    if (!line.IsDotLine) return;
    const h = line.state === 'Active' ? fontSize * 1.65 : 0;
    dotHeight.value = withSpring(h, {
      damping:   line.state === 'Active' ? 20 : 15,
      stiffness: line.state === 'Active' ? 200 : 140,
    });
  }, [line.state, line.IsDotLine, fontSize]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const dotStyle   = useAnimatedStyle(() => ({ height: dotHeight.value, overflow: 'hidden' as const }));
  const barStyle   = useAnimatedStyle(() => ({
    opacity:   barOpacity.value,
    transform: [{ scaleY: barScaleY.value }],
  }));

  // ── Syllable refs for imperative animation ─────────────────────────────────
  const syllables = useMemo(() => {
    const rawLead = (line as any).Lead;
    return Array.isArray(rawLead)
      ? rawLead
      : rawLead?.Syllables ?? (line as any).Syllables?.Lead ?? null;
  }, [line]);

  const wordRefs = useRef<(LyricsWordRef | null)[]>([]);

  // Memoize syllable timings as plain numbers for the worklet closure
  const sylTimings = useMemo(
    () => (syllables ?? []).map((s: any) => ({
      s: s.StartTime ?? s.startTime ?? 0,
      e: s.EndTime   ?? s.endTime   ?? 0,
    })),
    [syllables],
  );

  // Imperative handler called from UI thread via runOnJS
  const handleSylChange = useCallback((newIdx: number, prevIdx: number) => {
    const refs = wordRefs.current;
    const n    = refs.length;
    for (let i = 0; i < n; i++) {
      const skipped = i === newIdx && prevIdx !== -1 && i > prevIdx + 1;
      if (i < newIdx)        refs[i]?.setSung();
      else if (i === newIdx) refs[i]?.setActive(skipped);
      else                   refs[i]?.setNotYet();
    }
  }, []);

  // ONE reaction per active Syllable line — runs on UI thread at 60fps
  // but the callback (runOnJS) only fires when the active syllable index changes (~5-10×/s)
  useAnimatedReaction(
    () => {
      if (lyricsType !== 'Syllable' || !isActive) return -1;
      const prog = progressShared.value;
      const t = sylTimings; // captured by closure — small array of {s,e}
      for (let j = 0; j < t.length; j++) {
        if (prog >= t[j].s && prog < t[j].e) return j;
      }
      return t.length; // past all syllables
    },
    (cur, prev) => {
      'worklet';
      if (cur !== prev) runOnJS(handleSylChange)(cur, prev ?? -1);
    },
    [lyricsType, isActive, sylTimings, handleSylChange],
  );

  const isOpp = line.OppositeAligned ?? false;

  // ── Static ────────────────────────────────────────────────────────────────
  if (lyricsType === 'Static') {
    return (
      <View style={styles.outer}>
        <Animated.Text
          style={[
            styles.staticText,
            { fontSize: fontSize * 0.78, lineHeight: fontSize * 0.78 * 1.35 },
            isOpp ? styles.rightAligned : styles.leftAligned,
          ]}
        >
          {line.Text ?? ''}
        </Animated.Text>
      </View>
    );
  }

  // ── Musical / dot line ─────────────────────────────────────────────────────
  if (line.IsDotLine) {
    return (
      <View style={styles.outer}>
        <Animated.View style={dotStyle}>
          <MusicalLine isActive={isActive} fontSize={fontSize} />
        </Animated.View>
      </View>
    );
  }

  // ── Syllable ───────────────────────────────────────────────────────────────
  if (lyricsType === 'Syllable' && syllables && syllables.length > 0) {
    // Ensure refs array matches syllable count
    if (wordRefs.current.length !== syllables.length) {
      wordRefs.current = new Array(syllables.length).fill(null);
    }
    return (
      <View style={[styles.outer, isOpp ? styles.rightAligned : styles.leftAligned]}>
        <Animated.View style={contentStyle}>
          <View style={styles.wordRow}>
            {(syllables as any[]).map((s: any, i: number) => (
              <LyricsWord
                key={i}
                ref={(r) => { wordRefs.current[i] = r; }}
                text={s.Text ?? s.text ?? ''}
                fontSize={fontSize}
                isActive={isActive}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    );
  }

  // ── Line ──────────────────────────────────────────────────────────────────
  return (
    <View style={[styles.outer, styles.lineRow, isOpp ? styles.rightAligned : styles.leftAligned]}>
      <Animated.View style={[styles.activeBar, barStyle]} />
      <Animated.View style={[styles.lineContent, contentStyle]}>
        <Animated.Text
          style={[
            styles.lineText,
            { fontSize, lineHeight: fontSize * 1.182 },
            isActive && styles.activeGlow,
          ]}
        >
          {line.Text ?? ''}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

export const LyricsLine = memo(LyricsLineInner);

const styles = StyleSheet.create({
  outer: {
    marginVertical:  LINE_MARGIN_V,
    paddingHorizontal: 2,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  lineContent: { flex: 1 },
  lineText:    { fontWeight: '700', color: '#fff' },
  staticText:  { fontWeight: '500', color: 'rgba(255,255,255,0.92)', alignSelf: 'flex-start' },
  activeGlow: {
    textShadowColor:  'rgba(255,255,255,0.4)',
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  wordRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    alignItems:    'flex-start',
  },
  activeBar: {
    width:           3,
    height:          28,
    borderRadius:    2,
    backgroundColor: '#fff',
    marginRight:     10,
    flexShrink:      0,
  },
  rightAligned: { alignSelf: 'flex-end'   },
  leftAligned:  { alignSelf: 'flex-start' },
});
