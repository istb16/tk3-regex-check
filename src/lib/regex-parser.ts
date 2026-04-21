import type { NodeKind, Quantifier, RegexNode } from './types';

class Parser {
  private pos = 0;
  private groupCount = 0;

  constructor(private src: string) {}

  parse(): RegexNode {
    const node = this.parseAlternation();
    return node;
  }

  private parseAlternation(): RegexNode {
    const start = this.pos;
    const branches: RegexNode[] = [this.parseSequence()];

    while (this.pos < this.src.length && this.src[this.pos] === '|') {
      this.pos++;
      branches.push(this.parseSequence());
    }

    if (branches.length === 1) return branches[0];

    return {
      kind: 'alternation',
      raw: this.src.slice(start, this.pos),
      start,
      end: this.pos,
      label: `${branches.length} alternatives`,
      children: branches,
    };
  }

  private parseSequence(): RegexNode {
    const start = this.pos;
    const items: RegexNode[] = [];

    while (this.pos < this.src.length) {
      const ch = this.src[this.pos];
      if (ch === '|' || ch === ')') break;
      const node = this.parseQuantified();
      if (node) items.push(node);
    }

    if (items.length === 0) {
      return { kind: 'literal', raw: '', start, end: this.pos, label: 'empty' };
    }
    if (items.length === 1) return items[0];

    return {
      kind: 'sequence',
      raw: this.src.slice(start, this.pos),
      start,
      end: this.pos,
      label: `Sequence (${items.length})`,
      children: items,
    };
  }

  private parseQuantified(): RegexNode {
    const atom = this.parseAtom();
    if (!atom) return { kind: 'error', raw: '', start: this.pos, end: this.pos, label: 'error' };

    const q = this.parseQuantifier();
    if (!q) return atom;

    let qLabel = q.raw;
    if (q.min === 0 && q.max === null) qLabel = `0+ times`;
    else if (q.min === 1 && q.max === null) qLabel = `1+ times`;
    else if (q.min === 0 && q.max === 1) qLabel = `optional`;
    else if (q.min === q.max) qLabel = `exactly ${q.min}`;
    else if (q.max === null) qLabel = `${q.min}+ times`;
    else qLabel = `${q.min}–${q.max} times`;

    if (q.lazy) qLabel += ' (lazy)';

    return {
      kind: atom.kind,
      raw: atom.raw + q.raw,
      start: atom.start,
      end: this.pos,
      label: atom.label,
      children: atom.children,
      negative: atom.negative,
      capturing: atom.capturing,
      groupIndex: atom.groupIndex,
      name: atom.name,
      quantifier: { ...q, raw: qLabel },
    };
  }

  private parseQuantifier(): Quantifier | null {
    if (this.pos >= this.src.length) return null;
    const ch = this.src[this.pos];

    let min: number, max: number | null, rawQ: string;

    if (ch === '*') {
      min = 0; max = null; rawQ = '*'; this.pos++;
    } else if (ch === '+') {
      min = 1; max = null; rawQ = '+'; this.pos++;
    } else if (ch === '?') {
      min = 0; max = 1; rawQ = '?'; this.pos++;
    } else if (ch === '{') {
      const bStart = this.pos;
      this.pos++;
      let numStr = '';
      while (this.pos < this.src.length && this.src[this.pos] >= '0' && this.src[this.pos] <= '9') {
        numStr += this.src[this.pos++];
      }
      if (!numStr) { this.pos = bStart; return null; }
      min = parseInt(numStr);
      if (this.src[this.pos] === '}') {
        max = min; rawQ = `{${numStr}}`; this.pos++;
      } else if (this.src[this.pos] === ',') {
        this.pos++;
        let numStr2 = '';
        while (this.pos < this.src.length && this.src[this.pos] >= '0' && this.src[this.pos] <= '9') {
          numStr2 += this.src[this.pos++];
        }
        if (this.src[this.pos] !== '}') { this.pos = bStart; return null; }
        max = numStr2 ? parseInt(numStr2) : null;
        rawQ = `{${numStr},${numStr2}}`; this.pos++;
      } else {
        this.pos = bStart; return null;
      }
    } else {
      return null;
    }

    let lazy = false;
    if (this.pos < this.src.length && this.src[this.pos] === '?') {
      lazy = true; rawQ += '?'; this.pos++;
    }

    return { min, max, lazy, raw: rawQ };
  }

  private parseAtom(): RegexNode | null {
    if (this.pos >= this.src.length) return null;
    const ch = this.src[this.pos];
    const start = this.pos;

    if (ch === '(') return this.parseGroup();
    if (ch === '[') return this.parseCharClass();
    if (ch === '\\') return this.parseEscape();

    if (ch === '^') {
      this.pos++;
      return { kind: 'anchor', raw: '^', start, end: this.pos, label: 'Start of line' };
    }
    if (ch === '$') {
      this.pos++;
      return { kind: 'anchor', raw: '$', start, end: this.pos, label: 'End of line' };
    }
    if (ch === '.') {
      this.pos++;
      return { kind: 'wildcard', raw: '.', start, end: this.pos, label: 'Any char (except \\n)' };
    }

    this.pos++;
    const escaped = /[.*+?^${}()|[\]\\]/.test(ch);
    return {
      kind: 'literal',
      raw: ch,
      start,
      end: this.pos,
      label: escaped ? `"${ch}"` : `"${ch}"`,
    };
  }

  private parseGroup(): RegexNode {
    const start = this.pos;
    this.pos++;

    let kind: NodeKind = 'group';
    let name: string | undefined;
    let negative = false;
    let capturing = true;
    let label = '';

    if (this.pos < this.src.length && this.src[this.pos] === '?') {
      this.pos++;
      const next = this.src[this.pos];

      if (next === ':') {
        this.pos++;
        kind = 'nonCapturing';
        capturing = false;
        label = 'Non-capturing';
      } else if (next === '<') {
        this.pos++;
        const peek = this.src[this.pos];
        if (peek === '=') {
          this.pos++;
          kind = 'lookbehind';
          negative = false;
          label = 'Lookbehind (?<=…)';
        } else if (peek === '!') {
          this.pos++;
          kind = 'lookbehind';
          negative = true;
          label = 'Neg. Lookbehind (?<!…)';
        } else {
          let n = '';
          while (this.pos < this.src.length && this.src[this.pos] !== '>') n += this.src[this.pos++];
          this.pos++;
          name = n;
          this.groupCount++;
          kind = 'group';
          label = `Named group «${n}»`;
        }
      } else if (next === '=') {
        this.pos++;
        kind = 'lookahead';
        negative = false;
        label = 'Lookahead (?=…)';
      } else if (next === '!') {
        this.pos++;
        kind = 'lookahead';
        negative = true;
        label = 'Neg. Lookahead (?!…)';
      } else if (next === '>') {
        this.pos++;
        kind = 'atomic';
        capturing = false;
        label = 'Atomic group (?>…)';
      } else {
        this.pos--;
        this.groupCount++;
        kind = 'group';
        label = `Group #${this.groupCount}`;
      }
    } else {
      this.groupCount++;
      const idx = this.groupCount;
      label = `Capture group #${idx}`;
    }

    const inner = this.parseAlternation();

    if (this.pos < this.src.length && this.src[this.pos] === ')') this.pos++;

    return {
      kind,
      raw: this.src.slice(start, this.pos),
      start,
      end: this.pos,
      label,
      children: [inner],
      negative,
      capturing,
      name,
    };
  }

  private parseCharClass(): RegexNode {
    const start = this.pos;
    this.pos++;
    let negative = false;
    if (this.pos < this.src.length && this.src[this.pos] === '^') {
      negative = true; this.pos++;
    }

    let depth = 1;
    while (this.pos < this.src.length && depth > 0) {
      if (this.src[this.pos] === '\\') { this.pos += 2; continue; }
      if (this.src[this.pos] === '[') depth++;
      else if (this.src[this.pos] === ']') { depth--; }
      this.pos++;
    }

    const raw = this.src.slice(start, this.pos);
    return {
      kind: 'charClass',
      raw,
      start,
      end: this.pos,
      label: negative ? `Not in set ${raw}` : `Character set ${raw}`,
      negative,
    };
  }

  private parseEscape(): RegexNode {
    const start = this.pos;
    this.pos++;
    if (this.pos >= this.src.length) {
      return { kind: 'literal', raw: '\\', start, end: this.pos, label: '\\' };
    }

    const ch = this.src[this.pos++];
    let kind: NodeKind = 'escape';
    let label = '';

    switch (ch) {
      case 'd': label = '\\d  Digit [0-9]'; break;
      case 'D': label = '\\D  Non-digit'; break;
      case 'w': label = '\\w  Word char [a-zA-Z0-9_]'; break;
      case 'W': label = '\\W  Non-word'; break;
      case 's': label = '\\s  Whitespace'; break;
      case 'S': label = '\\S  Non-whitespace'; break;
      case 'b': kind = 'anchor'; label = '\\b  Word boundary'; break;
      case 'B': kind = 'anchor'; label = '\\B  Non-word boundary'; break;
      case 'n': label = '\\n  Newline'; break;
      case 't': label = '\\t  Tab'; break;
      case 'r': label = '\\r  Carriage return'; break;
      case '0': label = '\\0  Null char'; break;
      case 'p': {
        if (this.src[this.pos] === '{') {
          this.pos++;
          let cat = '';
          while (this.pos < this.src.length && this.src[this.pos] !== '}') cat += this.src[this.pos++];
          this.pos++;
          label = `\\p{${cat}}  Unicode property`;
        } else { label = '\\p  Unicode property'; }
        break;
      }
      case 'P': {
        if (this.src[this.pos] === '{') {
          this.pos++;
          let cat = '';
          while (this.pos < this.src.length && this.src[this.pos] !== '}') cat += this.src[this.pos++];
          this.pos++;
          label = `\\P{${cat}}  Negated Unicode`;
        } else { label = '\\P  Negated Unicode'; }
        break;
      }
      case 'u': {
        if (this.src[this.pos] === '{') {
          this.pos++;
          let hex = '';
          while (this.pos < this.src.length && this.src[this.pos] !== '}') hex += this.src[this.pos++];
          this.pos++;
          label = `\\u{${hex}}  Unicode code point`;
        } else {
          const hex = this.src.slice(this.pos, this.pos + 4);
          this.pos += Math.min(4, this.src.length - this.pos);
          label = `\\u${hex}  Unicode char`;
        }
        break;
      }
      case 'k': {
        if (this.src[this.pos] === '<') {
          this.pos++;
          let name = '';
          while (this.pos < this.src.length && this.src[this.pos] !== '>') name += this.src[this.pos++];
          this.pos++;
          kind = 'backreference';
          label = `\\k<${name}>  Named backref`;
        }
        break;
      }
      default: {
        if (ch >= '1' && ch <= '9') {
          kind = 'backreference';
          label = `\\${ch}  Backref #${ch}`;
        } else {
          kind = 'literal';
          label = `Escaped "${ch}"`;
        }
      }
    }

    return { kind, raw: this.src.slice(start, this.pos), start, end: this.pos, label };
  }
}

export function parseRegex(pattern: string): RegexNode {
  if (!pattern) {
    return { kind: 'sequence', raw: '', start: 0, end: 0, label: 'empty', children: [] };
  }
  try {
    return new Parser(pattern).parse();
  } catch {
    return { kind: 'error', raw: pattern, start: 0, end: pattern.length, label: 'Parse error' };
  }
}
