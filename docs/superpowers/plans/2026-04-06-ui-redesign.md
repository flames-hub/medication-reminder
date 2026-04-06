# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全5画面を Minimal / Apple Health 風にリデザインし「AIが作った感」を排除する。

**Architecture:** theme.ts にヘルパー追加 → DoseRow 新規作成 → 各画面を順番に更新 → 不要コンポーネント削除。ロジック・Store・API は一切変更しない。

**Tech Stack:** React Native, Expo, TypeScript, @react-navigation, react-native-safe-area-context

---

### Task 1: theme.ts — パレット更新 + getHeaderColors 追加

**Files:**
- Modify: `src/constants/theme.ts`

- [ ] **Step 1: mint と honey の primary を調整し、getHeaderColors を追加**

`src/constants/theme.ts` の `mint.primary` と `honey.primary` を変更し、ファイル末尾に関数を追加する。

```ts
// mint の primary を変更
const mint: Palette = {
  primary: '#3D9EA0',   // 旧: '#5CAAAB'
  primaryMuted: '#E8F5F5',
  // 残りはそのまま
  ...
};

// honey の primary を変更
const honey: Palette = {
  primary: '#C47A3A',   // 旧: '#D4935D'
  primaryMuted: '#FFF3E8',
  // 残りはそのまま
  ...
};
```

ファイル末尾（`Shadow` の後）に追加：

```ts
export type HeaderColors = {
  bg: string;
  text: string;
  tagBg: string;
  tagText: string;
};

export function getHeaderColors(themeId: ThemeId): HeaderColors {
  if (themeId === 'dark') {
    const p = ThemePalettes.dark;
    return { bg: p.surface, text: p.text, tagBg: 'rgba(255,255,255,0.08)', tagText: p.textSecondary };
  }
  const p = ThemePalettes[themeId];
  return { bg: p.primary, text: '#fff', tagBg: 'rgba(255,255,255,0.2)', tagText: '#fff' };
}
```

- [ ] **Step 2: 動作確認**

`npx expo start` でアプリ起動し、Settings でテーマを切り替えて既存画面が崩れていないことを確認。

- [ ] **Step 3: コミット**

```bash
git add src/constants/theme.ts
git commit -m "style: update mint/honey primary colors, add getHeaderColors helper"
```

---

### Task 2: DoseRow.tsx — 新規コンポーネント作成

**Files:**
- Create: `src/components/DoseRow.tsx`

- [ ] **Step 1: DoseRow コンポーネントを作成**

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MealTiming } from '../types';
import { Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface Props {
  logId: string;
  medicationName: string;
  dosage: number;
  unit: string;
  scheduledTime: string;
  mealTiming?: MealTiming;
  takenAt?: string;
  skipped: boolean;
  isLast?: boolean;
  onTake: (logId: string) => void;
  onSkip: (logId: string) => void;
}

export function DoseRow({
  logId, medicationName, dosage, unit, scheduledTime,
  takenAt, skipped, isLast, onTake, onSkip,
}: Props) {
  const { t } = useTranslation();
  const { colors, fontSize } = useTheme();

  const isTaken = !!takenAt;
  const isDone = isTaken || skipped;

  function handleLongPress() {
    if (isDone) return;
    Alert.alert(
      medicationName,
      undefined,
      [
        { text: t('today.skip'), style: 'destructive', onPress: () => onSkip(logId) },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  }

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      activeOpacity={isDone ? 1 : 0.6}
      accessibilityRole="button"
      accessibilityLabel={`${medicationName} ${scheduledTime}`}
      style={[
        styles.row,
        { borderBottomColor: colors.border, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth },
        isDone && styles.rowDone,
      ]}
    >
      {/* 状態ドット */}
      <View style={[styles.dot, { backgroundColor: isDone ? colors.muted : colors.primary }]} />

      {/* 薬名 + 用量 */}
      <View style={styles.info}>
        <Text
          style={{ color: isDone ? colors.muted : colors.text, fontSize: fontSize.md, fontWeight: '600',
            textDecorationLine: isDone ? 'line-through' : 'none' }}
          numberOfLines={1}
        >
          {medicationName}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm }}>
          {dosage} {unit}
        </Text>
      </View>

      {/* 時刻 */}
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginRight: Spacing.sm }}>
        {scheduledTime}
      </Text>

      {/* アクション */}
      {isTaken ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.successMuted }]}>
          <Text style={{ color: colors.success, fontSize: fontSize.xs, fontWeight: '700' }}>✓</Text>
        </View>
      ) : skipped ? (
        <View style={[styles.statusBadge, { backgroundColor: colors.warningMuted }]}>
          <Text style={{ color: colors.warning, fontSize: fontSize.xs, fontWeight: '700' }}>Skip</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.takeBtn, { backgroundColor: colors.primary }]}
          onPress={() => onTake(logId)}
          activeOpacity={0.75}
          accessibilityLabel={`${medicationName} ${t('today.take')}`}
          accessibilityRole="button"
        >
          <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '700' }}>
            {t('today.take')}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
  },
  rowDone: { opacity: 0.45 },
  dot: { width: 9, height: 9, borderRadius: 99, flexShrink: 0 },
  info: { flex: 1 },
  takeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    flexShrink: 0,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    flexShrink: 0,
  },
});
```

- [ ] **Step 2: コミット**

```bash
git add src/components/DoseRow.tsx
git commit -m "feat: add DoseRow component (minimal row style)"
```

---

### Task 3: TodayScreen.tsx — フルブリードヘッダー + 時間帯グループ

**Files:**
- Modify: `src/screens/TodayScreen.tsx`

- [ ] **Step 1: TodayScreen を全面書き換え**

```tsx
import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useMedicationStore } from '../store/medicationStore';
import { DoseRow } from '../components/DoseRow';
import { ProgressRing } from '../components/ProgressRing';
import { Spacing } from '../constants/theme';
import { getHeaderColors } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

function formatDate(lang: string): string {
  const now = new Date();
  if (lang.startsWith('ja')) {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${now.getMonth() + 1}月${now.getDate()}日（${weekdays[now.getDay()]}）`;
  }
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getGreeting(lang: string): string {
  const h = new Date().getHours();
  if (lang.startsWith('ja')) {
    if (h < 12) return 'おはようございます';
    if (h < 18) return 'こんにちは';
    return 'こんばんは';
  }
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

type TimeGroup = { time: string; items: ReturnType<typeof useMedicationStore.getState>['todaySchedule'] };

export function TodayScreen() {
  const { t, i18n } = useTranslation();
  const { colors, fontSize, themeId } = useTheme();
  const { todaySchedule, isLoading, loadTodaySchedule, takeDose, skipDose, getTodayStats } = useMedicationStore();
  const stats = getTodayStats();
  const header = getHeaderColors(themeId);

  useEffect(() => { loadTodaySchedule(); }, []);

  // 時刻でグループ化、完了/スキップを末尾に
  const timeGroups = useMemo((): TimeGroup[] => {
    const sorted = [...todaySchedule].sort((a, b) => {
      const aDone = a.takenAt || a.skipped ? 1 : 0;
      const bDone = b.takenAt || b.skipped ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return a.time.localeCompare(b.time);
    });
    const map = new Map<string, typeof sorted>();
    sorted.forEach((item) => {
      const key = item.time;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).map(([time, items]) => ({ time, items }));
  }, [todaySchedule]);

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} color={colors.primary} />;
  }

  const remaining = stats.total - stats.done;
  const skippedCount = todaySchedule.filter((d) => d.skipped && !d.takenAt).length;
  const allDone = stats.total > 0 && stats.done === stats.total;

  type FlatItem =
    | { type: 'group-header'; time: string }
    | { type: 'dose'; group: string; item: (typeof todaySchedule)[0]; isLast: boolean }
    | { type: 'group-gap' };

  const flatData: FlatItem[] = [];
  timeGroups.forEach((group, gi) => {
    flatData.push({ type: 'group-header', time: group.time });
    group.items.forEach((item, ii) => {
      flatData.push({ type: 'dose', group: group.time, item, isLast: ii === group.items.length - 1 });
    });
    if (gi < timeGroups.length - 1) flatData.push({ type: 'group-gap' });
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* フルブリードヘッダー */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: header.bg }}>
        <View style={[styles.header, { backgroundColor: header.bg }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={{ color: header.text, fontSize: fontSize.sm, opacity: 0.8 }}>
                {getGreeting(i18n.language)}
              </Text>
              <Text style={{ color: header.text, fontSize: fontSize.xl, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 }}>
                {formatDate(i18n.language)}
              </Text>
            </View>
            <ProgressRing done={stats.done} total={stats.total} size={46} strokeWidth={3} textStyle={{ color: header.text, fontSize: 11, fontWeight: '700' }} trackColor="rgba(255,255,255,0.25)" progressColor={header.text} />
          </View>
          <View style={styles.tagRow}>
            {allDone ? (
              <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                  {t('today.allDone')} ✓
                </Text>
              </View>
            ) : (
              <>
                {remaining > 0 && (
                  <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                    <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                      {t('today.remaining', { count: remaining })}
                    </Text>
                  </View>
                )}
                {stats.done > 0 && (
                  <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                    <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                      ✓ {t('today.doneCount', { count: stats.done })}
                    </Text>
                  </View>
                )}
                {skippedCount > 0 && (
                  <View style={[styles.tag, { backgroundColor: header.tagBg }]}>
                    <Text style={{ color: header.tagText, fontSize: fontSize.xs, fontWeight: '600' }}>
                      {t('today.skippedCount', { count: skippedCount })}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* スケジュールリスト */}
      <FlatList
        data={flatData}
        keyExtractor={(item, i) => `${item.type}-${i}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.type === 'group-header') {
            return (
              <Text style={[styles.sectionHeader, { color: colors.textSecondary, fontSize: fontSize.xs }]}>
                {item.time}
              </Text>
            );
          }
          if (item.type === 'group-gap') {
            return <View style={[styles.gap, { backgroundColor: colors.background }]} />;
          }
          return (
            <View style={{ backgroundColor: colors.surface }}>
              <DoseRow
                logId={item.item.logId}
                medicationName={item.item.medication.name}
                dosage={item.item.medication.dosage}
                unit={item.item.medication.unit}
                scheduledTime={item.item.time}
                mealTiming={item.item.medication.mealTiming}
                takenAt={item.item.takenAt}
                skipped={item.item.skipped}
                isLast={item.isLast}
                onTake={takeDose}
                onSkip={skipDose}
              />
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 36 }}>☀️</Text>
            <Text style={{ color: colors.text, fontSize: fontSize.lg, fontWeight: '600', marginTop: Spacing.sm }}>
              {t('today.empty')}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, textAlign: 'center', marginTop: Spacing.xs }}>
              {t('today.emptyHint')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { flex: 1 },
  tagRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  list: { paddingBottom: 24 },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  gap: { height: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
});
```

- [ ] **Step 2: ProgressRing の props を確認・調整**

`src/components/ProgressRing.tsx` を開いて `size`, `strokeWidth`, `textStyle`, `trackColor`, `progressColor` props が存在しない場合は、既存 props に合わせて TodayScreen のコードを調整する。

- [ ] **Step 3: 動作確認**

Expo で Today タブを確認。フルブリードヘッダー表示、時間帯グループ、服用/スキップ動作。

- [ ] **Step 4: コミット**

```bash
git add src/screens/TodayScreen.tsx
git commit -m "feat: redesign TodayScreen with full-bleed header and time groups"
```

---

### Task 4: AppNavigator.tsx — headerShown 設定

**Files:**
- Modify: `src/navigation/AppNavigator.tsx`

- [ ] **Step 1: Today タブに headerShown: false を追加**

```tsx
<Tab.Screen
  name="Today"
  component={TodayScreen}
  options={{ headerShown: false, tabBarLabel: t('tabs.today') }}
/>
```

- [ ] **Step 2: 動作確認**

Today タブのナビゲーションバーが非表示になり、フルブリードヘッダーが上まで伸びていることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/navigation/AppNavigator.tsx
git commit -m "style: hide navigator header for TodayScreen (custom full-bleed header)"
```

---

### Task 5: MedicationListScreen.tsx — イニシャル円 + 行リスト

**Files:**
- Modify: `src/screens/MedicationListScreen.tsx`

- [ ] **Step 1: MedicationListScreen を更新**

`renderItem` 部分を以下に置き換える（ロジックはそのまま）：

```tsx
// ファイル冒頭に追加
const INITIAL_BG_KEYS: Array<keyof typeof colors> = ['primaryMuted', 'successMuted', 'warningMuted', 'fill'];
const INITIAL_COLOR_KEYS: Array<keyof typeof colors> = ['primary', 'success', 'warning', 'textSecondary'];
```

`renderItem` を以下に変更：

```tsx
renderItem={({ item, index }) => {
  const bgKey = INITIAL_BG_KEYS[index % 4];
  const colorKey = INITIAL_COLOR_KEYS[index % 4];
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={() => handleEdit(item.id)}
      onLongPress={() => handleDelete(item.id, item.name)}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      {item.photoUri ? (
        <Image source={{ uri: item.photoUri }} style={styles.photo} />
      ) : (
        <View style={[styles.initial, { backgroundColor: colors[bgKey] as string }]}>
          <Text style={{ color: colors[colorKey] as string, fontSize: fontSize.lg, fontWeight: '700' }}>
            {item.name.charAt(0)}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={{ color: colors.text, fontSize: fontSize.md, fontWeight: '600' }}>{item.name}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: fontSize.sm, marginTop: 2 }}>
          {item.dosage} {t(`medication.units.${item.unit}`)} · {t(`medication.${item.frequency}`)} · {item.times.join(', ')}
        </Text>
      </View>
      <Text style={{ color: colors.muted, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
}}
```

`StyleSheet` を更新：

```tsx
const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingBottom: 80 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  photo: { width: 44, height: 44, borderRadius: 12, flexShrink: 0 },
  initial: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  fab: {
    position: 'absolute', bottom: Spacing.lg, right: Spacing.lg,
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  emptyWrap: { alignItems: 'center', marginTop: 64, paddingHorizontal: Spacing.lg },
});
```

- [ ] **Step 2: Card インポートを削除**

`import { Card } from '../components/GlassCard';` の行を削除。

- [ ] **Step 3: 動作確認**

薬一覧タブでイニシャル円表示、タップで編集画面遷移、長押しで削除確認。

- [ ] **Step 4: コミット**

```bash
git add src/screens/MedicationListScreen.tsx
git commit -m "style: redesign MedicationListScreen with initial circles and row list"
```

---

### Task 6: HistoryScreen.tsx — フルブリードヘッダー + スタイル更新

**Files:**
- Modify: `src/screens/HistoryScreen.tsx`

- [ ] **Step 1: adherenceCard を削除してフルブリードヘッダーを追加**

`HistoryScreen` の return 冒頭を以下に変更：

```tsx
// インポートに追加
import { SafeAreaView } from 'react-native-safe-area-context';
import { getHeaderColors } from '../constants/theme';

// useTheme に themeId を追加
const { colors, fontSize, themeId } = useTheme();
const header = getHeaderColors(themeId);
```

return 内の `<View style={...}>` を以下に変更：

```tsx
return (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
    {/* フルブリードヘッダー */}
    <SafeAreaView edges={['top']} style={{ backgroundColor: header.bg }}>
      <View style={[styles.headerInner, { backgroundColor: header.bg }]}>
        <View>
          <Text style={{ color: header.text, fontSize: fontSize.sm, opacity: 0.8 }}>
            {t('history.adherenceHint')}
          </Text>
          <Text style={{ color: header.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 }}>
            {t('history.adherence', { percent: adherence })}
          </Text>
        </View>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => {
            const [y, m] = currentMonth.split('-').map(Number);
            const d = new Date(y, m - 2, 1);
            setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
          }} hitSlop={12}>
            <Text style={{ color: header.text, fontSize: 22, opacity: 0.8 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ color: header.text, fontSize: fontSize.sm, fontWeight: '600', marginHorizontal: 8 }}>
            {currentMonth.replace('-', '年') + '月'}
          </Text>
          <TouchableOpacity onPress={() => {
            const [y, m] = currentMonth.split('-').map(Number);
            const d = new Date(y, m, 1);
            setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
          }} hitSlop={12}>
            <Text style={{ color: header.text, fontSize: 22, opacity: 0.8 }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    {/* 以降は既存のまま（adherenceCard の <Card> 行だけ削除） */}
```

既存の `<Card style={styles.adherenceCard}>...</Card>` ブロックを丸ごと削除する。

`StyleSheet` に追加：

```tsx
headerInner: {
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingBottom: 16,
},
monthNav: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4 },
```

- [ ] **Step 2: AppNavigator で History に headerShown: false を追加**

```tsx
<Tab.Screen
  name="History"
  component={HistoryScreen}
  options={{ headerShown: false, tabBarLabel: t('tabs.history') }}
/>
```

- [ ] **Step 3: doseRow スタイルをフラット行に更新**

モーダル内の `<TouchableOpacity style={[styles.doseRow, { backgroundColor: colors.fill, ...}]}>` から `backgroundColor: colors.fill` と `borderRadius: Radius.md` を削除し、代わりに `borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border` を追加。

- [ ] **Step 4: Card インポートを削除**

`import { Card } from '../components/GlassCard';` を削除。

- [ ] **Step 5: 動作確認**

履歴タブのフルブリードヘッダー、月ナビ、カレンダー、詳細モーダルを確認。

- [ ] **Step 6: コミット**

```bash
git add src/screens/HistoryScreen.tsx src/navigation/AppNavigator.tsx
git commit -m "style: redesign HistoryScreen with full-bleed header, update modal rows"
```

---

### Task 7: SettingsScreen.tsx — スウォッチ選択 + iOS行スタイル

**Files:**
- Modify: `src/screens/SettingsScreen.tsx`

- [ ] **Step 1: テーマ選択部分をスウォッチに変更**

`import { ThemeMeta, ThemePalettes } from '../constants/theme';` に `ThemePalettes` を追加。

`<Card style={[styles.themeRow]}>...</Card>` ブロックを以下に置き換え：

```tsx
<View style={[styles.swatchRow, { backgroundColor: colors.surface }]}>
  {THEME_IDS.map((id) => {
    const selected = id === themeId;
    const swatchColor = id === 'dark' ? '#2a2a2a' : ThemePalettes[id].primary;
    return (
      <TouchableOpacity
        key={id}
        onPress={() => setThemeId(id)}
        style={styles.swatchWrap}
        accessibilityRole="radio"
        accessibilityState={{ selected }}
      >
        <View style={[
          styles.swatch,
          { backgroundColor: swatchColor },
          selected && { borderWidth: 2.5, borderColor: colors.primary },
        ]}>
          {selected && <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>}
        </View>
        <Text style={{ color: selected ? colors.primary : colors.textSecondary, fontSize: fontSize.xs, fontWeight: selected ? '700' : '400', marginTop: 4 }}>
          {lang === 'ja' ? ThemeMeta[id].labelJa : ThemeMeta[id].labelEn}
        </Text>
      </TouchableOpacity>
    );
  })}
</View>
```

- [ ] **Step 2: 設定行を iOS スタイルに変更**

全 `<Card style={styles.row}>` を `<View style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>` に変更。

`StyleSheet` 更新：

```tsx
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg, paddingBottom: Spacing.xs, letterSpacing: 0.8 },
  swatchRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, paddingHorizontal: 8 },
  swatchWrap: { alignItems: 'center' },
  swatch: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { flex: 1 },
  themeBtn: {}, // 互換性のため残す（使われなくなる）
});
```

- [ ] **Step 3: Card インポートを削除**

`import { Card } from '../components/GlassCard';` を削除。

- [ ] **Step 4: 動作確認**

設定タブでスウォッチ表示・選択、テーマ切替、通知トグルを確認。

- [ ] **Step 5: コミット**

```bash
git add src/screens/SettingsScreen.tsx
git commit -m "style: redesign SettingsScreen with color swatches and iOS-style rows"
```

---

### Task 8: MedicationForm.tsx — iOS行フォームスタイル

**Files:**
- Modify: `src/components/MedicationForm.tsx`

- [ ] **Step 1: フォーム行スタイルを適用**

`ScrollView` 直下のセクション分け（Section）を iOS行スタイルに更新する。既存の `<View style={[styles.field, ...]}>` ラッパーのスタイルを以下に変更：

```tsx
// styles.field を更新
field: {
  backgroundColor: colors.surface,  // ← 動的に適用するため StyleSheet から外して inline に
  paddingHorizontal: Spacing.md,
  paddingVertical: 12,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: colors.border,
  flexDirection: 'row',
  alignItems: 'center',
},
fieldLabel: {
  width: 72,
  fontSize: fontSize.sm,
  color: colors.textSecondary,
  flexShrink: 0,
},
```

保存ボタンのスタイルを更新：

```tsx
// saveBtn
saveBtn: {
  margin: Spacing.md,
  padding: 14,
  borderRadius: Radius.lg,   // pill から lg に変更
  alignItems: 'center',
},
```

- [ ] **Step 2: 動作確認**

薬追加・編集モーダルでフォーム表示・保存を確認。

- [ ] **Step 3: コミット**

```bash
git add src/components/MedicationForm.tsx
git commit -m "style: update MedicationForm to iOS-style row layout"
```

---

### Task 9: 不要コンポーネントの削除

**Files:**
- Delete: `src/components/DoseCard.tsx`（全画面で DoseRow に置き換え済み）
- `src/components/GlassCard.tsx`（全画面で Card 使用箇所がなくなった後に削除）

- [ ] **Step 1: DoseCard の残存 import を確認**

```bash
grep -r "DoseCard" src/ --include="*.tsx"
```

出力が空であることを確認。

- [ ] **Step 2: GlassCard の残存 import を確認**

```bash
grep -r "GlassCard\|from.*Card" src/ --include="*.tsx"
```

`GlassCard` の import が残っていたら対象ファイルを修正してから削除。

- [ ] **Step 3: ファイルを削除**

```bash
rm src/components/DoseCard.tsx
rm src/components/GlassCard.tsx
```

- [ ] **Step 4: 動作確認**

`npx expo start` でエラーなく起動すること。全タブを一通り操作。

- [ ] **Step 5: コミット**

```bash
git add -A
git commit -m "chore: remove DoseCard and GlassCard (replaced by DoseRow and inline styles)"
```

---

## 実装順序まとめ

1. theme.ts（基盤）
2. DoseRow（新コンポーネント）
3. TodayScreen（メイン画面）
4. AppNavigator（headerShown）
5. MedicationListScreen
6. HistoryScreen + AppNavigator（History headerShown）
7. SettingsScreen
8. MedicationForm
9. 不要コンポーネント削除

## 注意事項

- `ProgressRing` の props（`size`, `strokeWidth`, `textStyle`, `trackColor`, `progressColor`）が存在しない場合は Task 3 Step 2 で調整すること
- `react-native-safe-area-context` はすでに Expo に含まれているが、`SafeAreaProvider` が `App.tsx` 最上位にあることを確認すること
- ロジック（Store / API / 課金）は一切変更しない
