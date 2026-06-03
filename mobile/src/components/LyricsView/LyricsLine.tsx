import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
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

// Extension gradient for Line mode (same as LyricsWord gradient):
// 180deg top→bottom, BRIGHT top half → DIM bottom half
// animated translateY from -H (dim) to 0 (bright) as lineFillSV 0→1
const LINE_GRAD_COLORS: [string, string, string, string] = [
  'rgba(255,255,255,0.90)',
  'rgba(255,255,255,0.90)',
  'rgba(255,255,255,0.35)',
  'rgba(255,255,255,0.35)',
];
const LINE_GRAD_LOCS: [number, number, number, number] = [0, 0.48, 0.52, 1];

export const LINE_MARGIN_V = 2;

function LyricsLineInner({ line, fontSize, progressShared, lyricsType, distanceFromActive }: Props) {
  const opacity    = useSharedValue(OPACITY_NOT_SUNG);
  const scale      = useSharedValue(1);
  const dotHeight  = useSharedValue(0);
  const barOpacity = useSharedValue(0);
  const barScaleY  = useSharedValue(0);
  // Line mode: gradient fill that sweeps from dim to bright as line plays
  const lineFillSV = useSharedValue(0);

  const isActive = line.state === 'Active';
  const LINE_H   = fontSize * 1.182;

  // Line-level opacity/scale transition
  useEffect(() => {
    if (lyricsType === 'Static') return;
    if (line.state === 'Active') {
      opacity.value    = withTiming(OPACITY_ACTIVE, { duration: TRANSITION_MS });
      barOpacity.value = withTiming(1, { duration: 200 });
      barScaleY.value  = withSpring(1, { damping: 12, stiffness: 180 });
      if (lyricsType === 'Line') {
        scale.value      = withTiming(SCALE_ACTIVE, { duration: TRANSITION_MS, easing: SCALE_EASING });
        lineFillSV.value = 0; // reset fill at start of line
      }
    } else if (line.state === 'Sung') {
      opacity.value    = withTiming(OPACITY_SUNG, { duration: TRANSITION_MS });
      scale.value      = withTiming(1, { duration: TRANSITION_MS, easing: SCALE_EASING });
      barOpacity.value = withTiming(0, { duration: 200 });
      barScaleY.value  = withTiming(0, { duration: 200 });
      if (lyricsType === 'Line') lineFillSV.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value    = withTiming(OPACITY_NOT_SUNG, { duration: TRANSITION_MS });
      scale.value      = withTiming(1, { duration: TRANSITION_MS, easing: SCALE_EASING });
      barOpacity.value = withTiming(0, { duration: 200 });
      barScaleY.value  = withTiming(0, { duration: 200 });
      if (lyricsType === 'Line') lineFillSV.value = withTiming(0, { duration: 200 });
    }
  }, [line.state, lyricsType]);

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
  const dotStyle = useAnimatedStyle(() => ({ height: dotHeight.value, overflow: 'hidden' as const }));
  const barStyle = useAnimatedStyle(() => ({
    opacity:   barOpacity.value,
    transform: [{ scaleY: barScaleY.value }],
  }));

  // Line mode: gradient translateY driven by lineFillSV
  // translateY = LINE_H * (fill - 1): -LINE_H (dim) → 0 (bright)
  const lineFillGradStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: LINE_H * (lineFillSV.value - 1) }],
  }));

  // Line mode gradient: continuous fill driven by progressShared on UI thread
  const lineStart = line.StartTime ?? 0;
  const lineEnd   = line.EndTime   ?? 0;
  useAnimatedReaction(
    () => {
      if (lyricsType !== 'Line' || !isActive || lineEnd <= lineStart) return -1;
      const v = (progressShared.value - lineStart) / (lineEnd - lineStart);
      return Math.max(0, Math.min(1, v));
    },
    (cur, prev) => {
      'worklet';
      if (cur >= 0 && cur !== prev) lineFillSV.value = cur;
    },
    [lyricsType, isActive, lineStart, lineEnd],
  );

  // ── Syllable refs for imperative animation ─────────────────────────────────
  const syllables = useMemo(() => {
    const rawLead = (line as any).Lead;
    return Array.isArray(rawLead)
      ? rawLead
      : rawLead?.Syllables ?? (line as any).Syllables?.Lead ?? null;
  }, [line]);

  const wordRefs = useRef<(LyricsWordRef | null)[]>([]);

  const sylTimings = useMemo(
    () => (syllables ?? []).map((s: any) => ({
      s: s.StartTime ?? s.startTime ?? 0,
      e: s.EndTime   ?? s.endTime   ?? 0,
    })),
    [syllables],
  );

  const handleSylChange = useCallback((newIdx: number, prevIdx: number) => {
    const refs  = wordRefs.current;
    const n     = refs.length;
    // Pass syllable duration so LyricsWord can animate the gradient fill correctly
    const durMs = newIdx < sylTimings.length
      ? Math.max(50, (sylTimings[newIdx].e - sylTimings[newIdx].s) * 1000)
      : 200;
    for (let i = 0; i < n; i++) {
      const skipped = i === newIdx && prevIdx !== -1 && i > prevIdx + 1;
      if (i < newIdx)        refs[i]?.setSung();
      else if (i === newIdx) refs[i]?.setActive(skipped, durMs);
      else                   refs[i]?.setNotYet();
    }
  }, [sylTimings]);

  useAnimatedReaction(
    () => {
      if (lyricsType !== 'Syllable' || !isActive) return -1;
      const prog = progressShared.value;
      const t = sylTimings;
      for (let j = 0; j < t.length; j++) {
        if (prog >= t[j].s && prog < t[j].e) return j;
      }
      return t.length;
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
  // Active line: MaskedView with animated gradient fill (top→bottom, dim→bright)
  // matching the extension's --gradient-position animation (0% → 100%)
  if (isActive) {
    return (
      <View style={[styles.outer, styles.lineRow, isOpp ? styles.rightAligned : styles.leftAligned]}>
        <Animated.View style={[styles.activeBar, barStyle]} />
        <Animated.View style={[styles.lineContent, contentStyle]}>
          <MaskedView
            style={{ flex: 1, height: LINE_H }}
            maskElement={
              <Text style={[styles.lineText, { fontSize, lineHeight: LINE_H }]}>
                {line.Text ?? ''}
              </Text>
            }
          >
            <Animated.View
              style={[
                { width: '100%', height: LINE_H * 2, position: 'absolute', top: 0 },
                lineFillGradStyle,
              ]}
            >
              <LinearGradient
                colors={LINE_GRAD_COLORS}
                locations={LINE_GRAD_LOCS}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </Animated.View>
          </MaskedView>
        </Animated.View>
      </View>
    );
  }

  // Non-active line: plain text (no MaskedView overhead)
  return (
    <View style={[styles.outer, styles.lineRow, isOpp ? styles.rightAligned : styles.leftAligned]}>
      <Animated.View style={[styles.activeBar, barStyle]} />
      <Animated.View style={[styles.lineContent, contentStyle]}>
        <Animated.Text
          style={[styles.lineText, { fontSize, lineHeight: LINE_H }]}
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
    marginVertical:    LINE_MARGIN_V,
    paddingHorizontal: 2,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  lineContent: { flex: 1 },
  lineText:    { fontWeight: '700', color: '#fff' },
  staticText:  { fontWeight: '500', color: 'rgba(255,255,255,0.92)', alignSelf: 'flex-start' },
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
