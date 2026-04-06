/** よく処方される薬の候補リスト（名前, デフォルト単位） */
export const MEDICATION_SUGGESTIONS: { name: string; unit: 'mg' | 'ml' | 'tablet' | 'capsule' | 'drop' | 'other' }[] = [
  // 解熱鎮痛
  { name: 'ロキソニン (ロキソプロフェン)', unit: 'tablet' },
  { name: 'カロナール (アセトアミノフェン)', unit: 'tablet' },
  { name: 'バファリン (アスピリン)', unit: 'tablet' },
  { name: 'イブプロフェン', unit: 'tablet' },
  // 胃腸
  { name: 'ガスター (ファモチジン)', unit: 'tablet' },
  { name: 'ムコスタ (レバミピド)', unit: 'tablet' },
  { name: 'ビオフェルミン', unit: 'tablet' },
  { name: 'タケキャブ', unit: 'tablet' },
  { name: 'ネキシウム', unit: 'capsule' },
  // 血圧・循環器
  { name: 'アムロジピン', unit: 'tablet' },
  { name: 'アジルサルタン (アジルバ)', unit: 'tablet' },
  { name: 'ワーファリン', unit: 'mg' },
  { name: 'バイアスピリン', unit: 'tablet' },
  // 糖尿病
  { name: 'メトホルミン', unit: 'mg' },
  { name: 'ジャヌビア (シタグリプチン)', unit: 'mg' },
  // コレステロール
  { name: 'クレストール (ロスバスタチン)', unit: 'tablet' },
  { name: 'リピトール (アトルバスタチン)', unit: 'tablet' },
  // アレルギー
  { name: 'アレグラ (フェキソフェナジン)', unit: 'tablet' },
  { name: 'クラリチン (ロラタジン)', unit: 'tablet' },
  { name: 'ザイザル (レボセチリジン)', unit: 'tablet' },
  // 抗生物質
  { name: 'クラリス (クラリスロマイシン)', unit: 'tablet' },
  { name: 'フロモックス (セフカペン)', unit: 'tablet' },
  { name: 'サワシリン (アモキシシリン)', unit: 'capsule' },
  // 精神・神経
  { name: 'デパス (エチゾラム)', unit: 'tablet' },
  { name: 'マイスリー (ゾルピデム)', unit: 'tablet' },
  { name: 'レクサプロ (エスシタロプラム)', unit: 'tablet' },
  // 喘息
  { name: 'シングレア (モンテルカスト)', unit: 'tablet' },
  // 甲状腺
  { name: 'チラーヂン (レボチロキシン)', unit: 'tablet' },
  // 点眼
  { name: 'ヒアレイン点眼液', unit: 'drop' },
  { name: 'クラビット点眼液', unit: 'drop' },
  // 漢方
  { name: '葛根湯', unit: 'other' },
  { name: '芍薬甘草湯', unit: 'other' },
  { name: '補中益気湯', unit: 'other' },
  // サプリメント
  { name: 'ビタミンD', unit: 'tablet' },
  { name: 'ビタミンB群', unit: 'tablet' },
  { name: '鉄剤', unit: 'tablet' },
  { name: '葉酸', unit: 'tablet' },
  { name: 'マグネシウム', unit: 'tablet' },
];
