# tk3-regex-check

正規表現をリアルタイムで検証・可視化するWebアプリです。

## 機能

- 正規表現のパース・エラー表示
- テキストに対するマッチ結果のハイライト表示
- 構文ツリーのダイアグラム表示
- マッチ詳細テーブル（名前付きキャプチャグループ対応）
- プリセット一覧からサンプルをロード
- 日本語 / 英語 切替 (i18n)

## 技術スタック

| カテゴリ | ライブラリ / バージョン |
|---|---|
| UI フレームワーク | Svelte 5 |
| ビルドツール | Vite 8 |
| スタイリング | Tailwind CSS 4 |
| 言語 | TypeScript 6 |
| バックエンド | Firebase 12 |

## セットアップ

```bash
npm install
```

## 開発

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

ビルド結果は `dist/` に出力されます。

## 型チェック

```bash
npm run check
```

### TypeScript 7 への移行条件

TypeScript は 6 系（`~6.0.3`）に据え置き。以下が TS 7 に対応したら上げる。

- `svelte-check`（4.7.7）: peerDependencies が `typescript: ^5.0.0 || ^6.0.0` で TS 7 を含まない。また内部で `require('typescript')` により TS の JS API（Language Service）を直接使っているが、TS 7（`typescript@7`）のパッケージは `main` が `lib/version.cjs` のみで従来の JS API を提供しない
- `svelte2tsx`（svelte-check の依存）: peerDependencies が `typescript: ^4.9.4 || ^5.0.0 || ^6.0.0`

## ビルド成果物のプレビュー

```bash
npm run preview
```
