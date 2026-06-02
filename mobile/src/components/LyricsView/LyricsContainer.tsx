import { useCallback, useEffect, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { SyncedLine } from '../../hooks/useLyricsSync';
import type { LyricsType } from '../../types/lyrics';
import { LyricsLine } from './LyricsLine';

interface Props {
  lines: SyncedLine[];
  activeIndex: number;
  progressSec: number;
  lyricsType: LyricsType;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Responsive font size: ~7% of lyrics container width, clamped to [30, 56]
const LYRICS_CONTAINER_W = SCREEN_W * 0.92; // portrait
const FONT_SIZE = Math.min(56, Math.max(30, LYRICS_CONTAINER_W * 0.07));
const ITEM_HEIGHT_ESTIMATE = FONT_SIZE * 1.5 + 8; // line height + margin

// Spacers so the first/last lines can be centered
const TOP_SPACER_HEIGHT = SCREEN_H * 0.25;
const BOTTOM_SPACER_HEIGHT = SCREEN_H * 0.45;

export function LyricsContainer({ lines, activeIndex, progressSec, lyricsType }: Props) {
  const listRef = useRef<FlatList<SyncedLine>>(null);
  const lastActiveIndex = useRef(-1);

  const scrollToActive = useCallback(
    (index: number) => {
      if (index < 0 || index >= lines.length) return;
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.35, // position active line at ~35% from top (like the extension)
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

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<SyncedLine>) => (
      <LyricsLine
        line={item}
        fontSize={FONT_SIZE}
        progressSec={item.state === 'Active' ? progressSec : 0}
        lyricsType={lyricsType}
      />
    ),
    [progressSec, lyricsType],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT_ESTIMATE,
      offset: TOP_SPACER_HEIGHT + ITEM_HEIGHT_ESTIMATE * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((_: SyncedLine, index: number) => String(index), []);

  const ListHeader = useCallback(() => <View style={{ height: TOP_SPACER_HEIGHT }} />, []);
  const ListFooter = useCallback(() => <View style={{ height: BOTTOM_SPACER_HEIGHT }} />, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={lines}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        onScrollToIndexFailed={({ index }) => {
          // Fallback: scroll to offset if index calculation fails
          listRef.current?.scrollToOffset({
            offset: TOP_SPACER_HEIGHT + ITEM_HEIGHT_ESTIMATE * index - SCREEN_H * 0.35,
            animated: true,
          });
        }}
      />
      {/* Fade masks at top and bottom — mirrors CSS mask-image */}
      <LinearGradient
        style={styles.maskTop}
        colors={['rgba(0,0,0,0.75)', 'transparent']}
        pointerEvents="none"
      />
      <LinearGradient
        style={styles.maskBottom}
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  content: { paddingHorizontal: 28 },
  maskTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 80 },
  maskBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 },
});
