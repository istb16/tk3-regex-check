export type NodeKind =
  | 'sequence'
  | 'alternation'
  | 'group'
  | 'nonCapturing'
  | 'lookahead'
  | 'lookbehind'
  | 'atomic'
  | 'charClass'
  | 'literal'
  | 'escape'
  | 'anchor'
  | 'wildcard'
  | 'backreference'
  | 'error';

export interface Quantifier {
  min: number;
  max: number | null;
  lazy: boolean;
  raw: string;
}

export interface RegexNode {
  kind: NodeKind;
  raw: string;
  start: number;
  end: number;
  label: string;
  children?: RegexNode[];
  quantifier?: Quantifier;
  negative?: boolean;
  capturing?: boolean;
  groupIndex?: number;
  name?: string;
}

export interface TextSegment {
  text: string;
  matchIndex: number;
  groupIndex: number;
  isStart: boolean;
}

export interface MatchResult {
  index: number;
  value: string;
  groups: { index: number; value: string; name?: string; start: number; end: number }[];
  start: number;
  end: number;
}

export interface Preset {
  id: string;
  name: string;
  category: string;
  pattern: string;
  flags: string;
  description: string;
  testText: string;
  aiGenerated?: boolean;
}
