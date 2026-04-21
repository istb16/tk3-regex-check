export type Lang = 'en' | 'ja';

function createLangStore() {
  let current = $state<Lang>('en');
  return {
    get current() { return current; },
    set(l: Lang) { current = l; },
  };
}

export const langStore = createLangStore();

export const translations = {
  en: {
    header: {
      subtitle: 'ES2025+ Debugger',
    },
    tabs: {
      matches: (n: number) => n > 0 ? `Matches (${n})` : 'Matches',
      flagsRef: 'Flags Reference',
      diagram: 'Diagram',
      presets: 'Presets',
    },
    regex: {
      placeholder: 'Enter regex pattern…',
      noMatches: 'No matches',
      matchCount: (n: number) => `${n} match${n !== 1 ? 'es' : ''}`,
      typePattern: 'Type a pattern above',
    },
    test: {
      title: 'Test String',
      highlightsOn: 'Highlights ON',
      raw: 'Raw',
      placeholder: 'Paste or type your test string here…',
      tooLarge: (chars: string) =>
        `⚠ Text too large for highlight rendering (${chars} chars). Match engine still runs.`,
    },
    matches: {
      noMatchesFound: 'No matches found',
      fullMatch: (n: number) => `Full match (#${n})`,
      empty: '(empty)',
      captureGroups: 'Capture groups',
      limit: '500+ limit',
    },
    presets: {
      searchPlaceholder: 'Search presets…',
      all: 'All',
      noPresetsFound: 'No presets found',
    },
    diagram: {
      enterPattern: 'Enter a pattern to see the structure diagram',
      invalidPattern: 'Invalid pattern',
      patternLabel: 'Pattern',
      or: '── or ──',
      neg: 'neg',
      expand: 'expand',
      collapse: 'collapse',
      legend: [
        { key: 'Group',       color: 'text-blue-400' },
        { key: 'NonCap',      color: 'text-slate-400' },
        { key: 'Lookahead',   color: 'text-violet-400' },
        { key: 'Lookbehind',  color: 'text-purple-400' },
        { key: 'Set[…]',      color: 'text-emerald-400' },
        { key: 'Escape\\',    color: 'text-cyan-400' },
        { key: 'Anchor',      color: 'text-rose-400' },
        { key: 'Any .',       color: 'text-yellow-400' },
        { key: 'Backref',     color: 'text-pink-400' },
      ],
    },
    flagTooltips: {
      g: 'Global — find all matches',
      i: 'Case insensitive',
      m: 'Multiline — ^ and $ match line starts/ends',
      s: 'DotAll — . matches newlines too',
      u: 'Unicode mode',
      v: 'Unicode Sets (ES2024) — extended \\p{} and set notation',
      d: 'HasIndices (ES2022) — capture group start/end indices',
      y: 'Sticky — match from lastIndex only',
    } as Record<string, string>,
    flagsRef: {
      colFlag: 'Flag',
      colSince: 'Since',
      colDesc: 'Description',
      descs: {
        g: 'Global — find all matches',
        i: 'Case-insensitive',
        m: 'Multiline — ^ $ match line boundaries',
        s: 'DotAll — . also matches newlines',
        u: 'Unicode — enables \\p{…} \\u{…}',
        y: 'Sticky — anchored to lastIndex',
        d: 'HasIndices — returns capture group indices via match.indices',
        v: 'UnicodeSets — set operations, \\q{…} string disjunction',
      } as Record<string, string>,
    },
    categories: {
      All: 'All',
      Common: 'Common',
      Network: 'Network',
      Logs: 'Logs',
      'Unicode (ES2024+)': 'Unicode (ES2024+)',
      'Lookahead / Lookbehind': 'Lookahead / Lookbehind',
      Groups: 'Groups',
      'AI Debug Challenge': 'AI Debug Challenge',
    } as Record<string, string>,
  },
  ja: {
    header: {
      subtitle: 'ES2025+ デバッガー',
    },
    tabs: {
      matches: (n: number) => n > 0 ? `マッチ一覧 (${n})` : 'マッチ一覧',
      flagsRef: 'フラグ一覧',
      diagram: 'ダイアグラム',
      presets: 'プリセット',
    },
    regex: {
      placeholder: '正規表現パターンを入力…',
      noMatches: 'マッチなし',
      matchCount: (n: number) => `${n} 件マッチ`,
      typePattern: 'パターンを入力してください',
    },
    test: {
      title: 'テスト文字列',
      highlightsOn: 'ハイライト表示',
      raw: 'プレーン',
      placeholder: 'テスト文字列をここに入力またはペースト…',
      tooLarge: (chars: string) =>
        `⚠ テキストが大きすぎてハイライト不可 (${chars} 文字)。マッチ処理は実行されます。`,
    },
    matches: {
      noMatchesFound: 'マッチなし',
      fullMatch: (n: number) => `完全一致 (#${n})`,
      empty: '(空)',
      captureGroups: 'キャプチャグループ',
      limit: '500件上限',
    },
    presets: {
      searchPlaceholder: 'プリセット検索…',
      all: 'すべて',
      noPresetsFound: 'プリセットが見つかりません',
    },
    diagram: {
      enterPattern: 'パターンを入力すると構造ダイアグラムが表示されます',
      invalidPattern: '無効なパターン',
      patternLabel: 'パターン',
      or: '── または ──',
      neg: '否定',
      expand: '展開',
      collapse: '折畳',
      legend: [
        { key: 'グループ',     color: 'text-blue-400' },
        { key: '非キャプチャ', color: 'text-slate-400' },
        { key: '先読み',       color: 'text-violet-400' },
        { key: '後読み',       color: 'text-purple-400' },
        { key: '文字クラス',   color: 'text-emerald-400' },
        { key: 'エスケープ',   color: 'text-cyan-400' },
        { key: 'アンカー',     color: 'text-rose-400' },
        { key: '任意文字',     color: 'text-yellow-400' },
        { key: '後方参照',     color: 'text-pink-400' },
      ],
    },
    flagTooltips: {
      g: 'グローバル — すべての一致を検索',
      i: '大文字小文字を区別しない',
      m: '複数行 — ^ と $ が行頭・行末に一致',
      s: 'DotAll — . が改行にも一致',
      u: 'Unicode モード',
      v: 'Unicode セット (ES2024) — \\p{} 拡張とセット記法',
      d: 'HasIndices (ES2022) — キャプチャグループの開始・終了インデックス',
      y: 'Sticky — lastIndex からのみ一致',
    } as Record<string, string>,
    flagsRef: {
      colFlag: 'フラグ',
      colSince: 'ES バージョン',
      colDesc: '説明',
      descs: {
        g: 'グローバル — すべての一致を検索',
        i: '大文字小文字を区別しない',
        m: '複数行 — ^ $ が行境界に一致',
        s: 'DotAll — . が改行にも一致',
        u: 'Unicode — \\p{…} \\u{…} が使用可能',
        y: 'Sticky — lastIndex に固定',
        d: 'HasIndices — match.indices でキャプチャグループのインデックスを取得',
        v: 'UnicodeSets — 集合演算、\\q{…} 文字列選択',
      } as Record<string, string>,
    },
    categories: {
      All: 'すべて',
      Common: '汎用',
      Network: 'ネットワーク',
      Logs: 'ログ',
      'Unicode (ES2024+)': 'Unicode (ES2024+)',
      'Lookahead / Lookbehind': '先読み / 後読み',
      Groups: 'グループ',
      'AI Debug Challenge': 'AI デバッグ課題',
    } as Record<string, string>,
  },
};

export type Translations = typeof translations.en;
