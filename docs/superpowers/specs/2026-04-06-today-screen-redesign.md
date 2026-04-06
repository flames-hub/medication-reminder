# Medication Reminder — 全画面UIリデザイン

**日付**: 2026-04-06  
**スコープ**: 全5画面 + テーマカラー刷新  
**方針**: Minimal / Apple Health風。「AIが作った感」を排除し、人間が設計したように見えるUI。

---

## 背景と目的

現行UIの課題：
- カードの左ボーダー3px、アイコン+primaryMuted背景など「AIデザイン定番パターン」が多用されている
- ProgressRingがヘッダー中央に鎮座する構成がジェネリック
- フラットリストで時間帯の文脈がない
- 全画面で個性がなく、医療系アプリとして区別しづらい

改善方針：
- フルブリードカラーヘッダーで個性と視認性を確保
- 時間帯グループで服薬行動に寄り添った情報構造
- Card+ボーダー → 行リスト（区切り線のみ）でミニマルに
- テーマカラーをヘッダーに使うことでテーマ切替の体験を高める

---

## デザインシステム変更

### theme.ts — カラーパレット更新

`primary` をヘッダー背景として直接使う。可読性のため2テーマは primary を調整。

| テーマ | primary（現行→新） | ヘッダー文字色 |
|---|---|---|
| さくら | #E8788A → #E8788A（変更なし） | #fff |
| みんと | #5CAAAB → #3D9EA0（やや濃く） | #fff |
| はちみつ | #D4935D → #C47A3A（やや濃く） | #fff |
| ダーク | #f59e0b（変更なし） | ヘッダー背景: surface (#161513)、文字: text |

### 新規ヘルパー関数

```ts
// theme.ts に追加
export function getHeaderColors(themeId: ThemeId) {
  if (themeId === 'dark') {
    const p = ThemePalettes.dark;
    return { bg: p.surface, text: p.text, tagBg: 'rgba(255,255,255,0.08)', tagText: p.textSecondary };
  }
  const p = ThemePalettes[themeId];
  return { bg: p.primary, text: '#fff', tagBg: 'rgba(255,255,255,0.2)', tagText: '#fff' };
}
```

---

## 画面別設計

### 1. TodayScreen + DoseRow（新コンポーネント）

**ヘッダー（フルブリード）**
- `SafeAreaView edges={['top']}` でステータスバーまで色を伸ばす
- 背景: `getHeaderColors(themeId).bg`
- 左: 時間帯挨拶（6-11時=おはよう、12-17時=こんにちは、18時以降=こんばんは）+ 日付
- 右: ProgressRing を `size=44, strokeWidth=3` で小さく再利用
- 下段: タグ2個（「残り N回」「✓ N回完了」）。全完了時は「すべて服用済み ✓」1個

**ボディ**
- 背景: `colors.background`
- todaySchedule を時刻でグループ化（同一時刻をまとめる）
- セクションヘッダー: `朝 · 08:00` 形式、uppercase, `colors.textSecondary`
- グループ間区切り帯: `height: 8, backgroundColor: colors.background`

**DoseCard → DoseRow**（コンポーネント名変更 + 再実装）
- Card ラッパー・borderLeft を削除
- 行構成: `dot(9px) | name + dosage | time | button`
- dot色: 未服用=`colors.primary`、服用済/スキップ=`colors.muted`
- 服用済: `textDecorationLine: 'line-through'`、行全体 `opacity: 0.45`
- 服用ボタン: インラインカプセル（右端、`paddingH:12, paddingV:4, borderRadius:99`）
- スキップ: ボタン長押し → Alert（「スキップ」「キャンセル」）

**AppNavigator変更**
- Today・History タブに `headerShown: false`（自前ヘッダー使用）

---

### 2. MedicationListScreen

- Card + iconWrap → シンプルな行リスト
- 左: イニシャル円（薬名先頭1文字、`index % 4` で `[primaryMuted, successMuted, warningMuted, fill]` からbg色選択、文字色は対応するsolid色）
- 中: 薬名(bold) + 用量・頻度・時刻
- 右: シェブロン `›` → タップで AddMedication（編集）へ遷移
- 削除: 長押し → Alert（現行ロジック維持）
- FAB 維持

---

### 3. HistoryScreen

- adherenceCard（Card）を削除
- フルブリードヘッダー（TodayScreen 同パターン）に服薬率 + 月ナビを統合
- CalendarHeatmap・詳細モーダルのロジックは変更なし
- モーダル内 doseRow: `colors.fill` 背景 View → 区切り線スタイルに変更
- 凡例を横一列にコンパクト化

---

### 4. SettingsScreen

- テーマ選択: Card + アイコンボタン → 横並び丸スウォッチ（44px）
  - 選択状態: `borderWidth:2, borderColor: colors.primary` + 外側白リング
- 設定行: iOS標準（ラベル左 + 値/トグル右）、Card ラッパー削除
- 背景グループ: `colors.fill` の帯 + `colors.border` の区切り線

---

### 5. AddMedicationScreen（モーダル）

- Card ラッパー削除 → iOS行フォーム（`label固定幅 | input/value`）
- キャンセル/保存をモーダルヘッダーに配置（AppNavigator の headerLeft/Right）
- 保存ボタン: フルWidth、`colors.primary`、`Radius.lg`
- フォームロジック・バリデーション変更なし

---

## 変更ファイル一覧

| ファイル | 変更種別 |
|---|---|
| `constants/theme.ts` | primary 2色調整、`getHeaderColors()` 追加 |
| `screens/TodayScreen.tsx` | フルブリードヘッダー、時間帯グループ、DoseRow 使用 |
| `components/DoseCard.tsx` → `DoseRow.tsx` | 全面再実装（ファイル名変更） |
| `screens/MedicationListScreen.tsx` | イニシャル円、行リスト |
| `screens/HistoryScreen.tsx` | フルブリードヘッダー、モーダルスタイル更新 |
| `screens/SettingsScreen.tsx` | スウォッチ選択、iOS行スタイル |
| `screens/AddMedicationScreen.tsx` | iOS行フォーム |
| `navigation/AppNavigator.tsx` | Today/History に `headerShown: false` |
| `components/GlassCard.tsx` | 使用箇所消滅後に削除 |

---

## 変更しないもの

- Store / API / ロジック — 一切変更なし
- CalendarHeatmap — 変更なし
- PaywallModal — 変更なし
- ProgressRing — サイズ変更して再利用
- i18n キー — 変更なし
- RevenueCat / 課金フロー — 変更なし
