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

## ビルド成果物のプレビュー

```bash
npm run preview
```
