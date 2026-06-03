import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { SharedValue } from 'react-native-reanimated';
import type { SyncedLine } from '../../hooks/useLyricsSync';
import type { LyricsType } from '../../types/lyrics';
import { LyricsLine, LINE_MARGIN_V } from './LyricsLine';

interface Props {
  lines: SyncedLine[];
  activeIndex: number;
  progressShared: SharedValue<number>;
  lyricsType: LyricsType;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CONTAINER_W = SCREEN_W * 0.90;
const FONT_SYNCED = Math.min(56, Math.max(30, CONTAINER_W * 0.072));
const FONT_STATIC = Math.min(40, Math.max(16, CONTAINER_W * 0.052));

const TOP_SPACER    = SCREEN_H * 0.25;
const BOTTOM_SPACER = SCREEN_H * 0.45;
const SCROLL_COOLDOWN_MS = 750;
const MASK_HEIGHT = 100;

function LyricsContainerInner({ lines, activeIndex, progressShared, lyricsType }: Props) {
  const listRef            = useRef<FlatList<SyncedLine>>(null);
  const lastActiveIndex    = useRef(-1);
  const lastUserScrollTime = useRef(0);

  const fontSize = lyricsType === 'Static' ? FONT_STATIC : FONT_SYNCED;

  const scrollToActive = useCallback(
    (index: number) => {
      if (index < 0 || index >= lines.length) return;
      if (Date.now() - lastUserScrollTime.current < SCROLL_COOLDOWN_MS) return;
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.30,
        viewOffset: 0,
      });
    },
    [lines.length],
  );

  useEffect(() => {
    if (activeIndex !== lastActiveIndex.current && activeIndex >= 0) {
      lastActiveIndex.current = activeIndex;
      scrollToActive(activeIndex);
    }
  }, [activeIndex, scrollToActive]);

  const onUserScroll = useCallback((_: NativeSyntheticEvent<NativeScrollEvent>) => {
    lastUserScrollTime.current = Date.now();
  }, []);

  // renderItem: progressShared is a stable SharedValue reference — never recreates
  // on each 100ms tick. FlatList only re-renders when activeIndex changes (line boundaries).
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SyncedLine>) => {
      const dist = activeIndex >= 0 ? Math.abs(item.index - activeIndex) : -1;
      return (
        <LyricsLine
          line={item}
          fontSize={fontSize}
          progressShared={progressShared}
          lyricsType={lyricsType}
          distanceFromActive={dist}
        />
      );
    },
    [lyricsType, fontSize, activeIndex, progressShared],
  );

  const keyExtractor = useCallback((_: SyncedLine, i: number) => String(i), []);
  const ListHeader   = useCallback(() => <View style={{ height: TOP_SPACER }} />, []);
  const ListFooter   = useCallback(() => <View style={{ height: BOTTOM_SPACER }} />, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={lines}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={onUserScroll}
        contentContainerStyle={styles.content}
        removeClippedSubviews
        maxToRenderPerBatch={5}
        windowSize={3}
        updateCellsBatchingPeriod={100}
        initialNumToRender={12}
        onScrollToIndexFailed={({ index, highestMeasuredFrameIndex }) => {
          if (highestMeasuredFrameIndex >= 0) {
            listRef.current?.scrollToIndex({
              index: Math.min(index, highestMeasuredFrameIndex),
              animated: false,
              viewPosition: 0.30,
            });
          }
          setTimeout(() => {
            if (index < lines.length) {
              listRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0.30,
              });
            }
          }, 120);
        }}
      />

      <LinearGradient
        style={[styles.mask, styles.maskTop]}
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.0)']}
        locations={[0, 1]}
        pointerEvents="none"
      />
      <LinearGradient
        style={[styles.mask, styles.maskBottom]}
        colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.85)']}
        locations={[0, 1]}
        pointerEvents="none"
      />
    </View>
  );
}

// memo: prevents re-renders every 100ms (LyricsScreen re-renders with new progressMs,
// but lines/activeIndex/progressShared are stable between line changes)
export const LyricsContainer = memo(LyricsContainerInner);

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  content:   { paddingHorizontal: 28 },
  mask:      { position: 'absolute', left: 0, right: 0, height: MASK_HEIGHT },
  maskTop:   { top: 0 },
  maskBottom:{ bottom: 0 },
});
