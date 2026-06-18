import { describe, it, expect } from 'vitest'
import { parseRegex } from '../regex-parser'

describe('parseRegex', () => {
  it('returns empty sequence for empty string', () => {
    const node = parseRegex('')
    expect(node.kind).toBe('sequence')
    expect(node.children).toEqual([])
  })

  describe('literals', () => {
    it('single literal has correct kind, raw, label, span', () => {
      const node = parseRegex('a')
      expect(node.kind).toBe('literal')
      expect(node.raw).toBe('a')
      expect(node.label).toBe('"a"')
      expect(node.start).toBe(0)
      expect(node.end).toBe(1)
    })

    it('two literals produce a sequence', () => {
      const node = parseRegex('ab')
      expect(node.kind).toBe('sequence')
      expect(node.children).toHaveLength(2)
      expect(node.start).toBe(0)
      expect(node.end).toBe(2)
    })

    it('three literals produce a sequence of 3', () => {
      const node = parseRegex('abc')
      expect(node.kind).toBe('sequence')
      expect(node.children).toHaveLength(3)
    })
  })

  describe('anchors', () => {
    it('^ is start-of-line anchor', () => {
      const node = parseRegex('^')
      expect(node.kind).toBe('anchor')
      expect(node.label).toBe('Start of line')
    })

    it('$ is end-of-line anchor', () => {
      const node = parseRegex('$')
      expect(node.kind).toBe('anchor')
      expect(node.label).toBe('End of line')
    })
  })

  describe('wildcard', () => {
    it('. produces wildcard node', () => {
      const node = parseRegex('.')
      expect(node.kind).toBe('wildcard')
      expect(node.label).toBe('Any char (except \\n)')
    })
  })

  describe('quantifiers', () => {
    it('* → min=0, max=null, not lazy, label "0+ times"', () => {
      const node = parseRegex('a*')
      expect(node.quantifier).toBeDefined()
      expect(node.quantifier!.min).toBe(0)
      expect(node.quantifier!.max).toBeNull()
      expect(node.quantifier!.lazy).toBe(false)
      expect(node.quantifier!.raw).toBe('0+ times')
    })

    it('+ → min=1, max=null, label "1+ times"', () => {
      const node = parseRegex('a+')
      expect(node.quantifier!.min).toBe(1)
      expect(node.quantifier!.max).toBeNull()
      expect(node.quantifier!.raw).toBe('1+ times')
    })

    it('? → min=0, max=1, label "optional"', () => {
      const node = parseRegex('a?')
      expect(node.quantifier!.min).toBe(0)
      expect(node.quantifier!.max).toBe(1)
      expect(node.quantifier!.raw).toBe('optional')
    })

    it('{3} → exact, label "exactly 3"', () => {
      const node = parseRegex('a{3}')
      expect(node.quantifier!.min).toBe(3)
      expect(node.quantifier!.max).toBe(3)
      expect(node.quantifier!.raw).toBe('exactly 3')
    })

    it('{2,5} → range, label "2–5 times"', () => {
      const node = parseRegex('a{2,5}')
      expect(node.quantifier!.min).toBe(2)
      expect(node.quantifier!.max).toBe(5)
      expect(node.quantifier!.raw).toBe('2–5 times')
    })

    it('{2,} → open-ended, label "2+ times"', () => {
      const node = parseRegex('a{2,}')
      expect(node.quantifier!.min).toBe(2)
      expect(node.quantifier!.max).toBeNull()
      expect(node.quantifier!.raw).toBe('2+ times')
    })

    it('*? → lazy star', () => {
      const node = parseRegex('a*?')
      expect(node.quantifier!.lazy).toBe(true)
      expect(node.quantifier!.raw).toBe('0+ times (lazy)')
    })

    it('+? → lazy plus', () => {
      const node = parseRegex('a+?')
      expect(node.quantifier!.lazy).toBe(true)
      expect(node.quantifier!.raw).toBe('1+ times (lazy)')
    })

    it('?? → lazy optional', () => {
      const node = parseRegex('a??')
      expect(node.quantifier!.lazy).toBe(true)
      expect(node.quantifier!.raw).toBe('optional (lazy)')
    })

    it('{3}? → lazy exact', () => {
      const node = parseRegex('a{3}?')
      expect(node.quantifier!.lazy).toBe(true)
      expect(node.quantifier!.raw).toBe('exactly 3 (lazy)')
    })

    it('quantifier preserves the underlying node kind', () => {
      const node = parseRegex('a+')
      expect(node.kind).toBe('literal')
    })

    it('{x} with non-digit is not parsed as quantifier', () => {
      const node = parseRegex('a{x}')
      expect(node.kind).toBe('sequence')
    })
  })

  describe('alternation', () => {
    it('a|b → alternation with 2 branches', () => {
      const node = parseRegex('a|b')
      expect(node.kind).toBe('alternation')
      expect(node.children).toHaveLength(2)
      expect(node.label).toBe('2 alternatives')
    })

    it('a|b|c → alternation with 3 branches', () => {
      const node = parseRegex('a|b|c')
      expect(node.kind).toBe('alternation')
      expect(node.children).toHaveLength(3)
      expect(node.label).toBe('3 alternatives')
    })

    it('multi-char branches retain correct raw values', () => {
      const node = parseRegex('ab|cd')
      expect(node.kind).toBe('alternation')
      expect(node.children![0].raw).toBe('ab')
      expect(node.children![1].raw).toBe('cd')
    })
  })

  describe('character classes', () => {
    it('[abc] → positive charClass', () => {
      const node = parseRegex('[abc]')
      expect(node.kind).toBe('charClass')
      expect(node.negative).toBe(false)
      expect(node.raw).toBe('[abc]')
      expect(node.label).toContain('Character set')
    })

    it('[^abc] → negative charClass', () => {
      const node = parseRegex('[^abc]')
      expect(node.kind).toBe('charClass')
      expect(node.negative).toBe(true)
      expect(node.label).toContain('Not in set')
    })

    it('[a-z] range class is parsed correctly', () => {
      const node = parseRegex('[a-z]')
      expect(node.kind).toBe('charClass')
      expect(node.raw).toBe('[a-z]')
    })

    it('[\\]] escaped bracket terminates class', () => {
      const node = parseRegex('[\\]]')
      expect(node.kind).toBe('charClass')
      expect(node.raw).toBe('[\\]]')
    })

    it('charClass with quantifier', () => {
      const node = parseRegex('[a-z]{2,4}')
      expect(node.kind).toBe('charClass')
      expect(node.quantifier!.min).toBe(2)
      expect(node.quantifier!.max).toBe(4)
    })
  })

  describe('escape sequences', () => {
    const table: [string, string, string][] = [
      ['\\d', 'escape', '\\d  Digit [0-9]'],
      ['\\D', 'escape', '\\D  Non-digit'],
      ['\\w', 'escape', '\\w  Word char [a-zA-Z0-9_]'],
      ['\\W', 'escape', '\\W  Non-word'],
      ['\\s', 'escape', '\\s  Whitespace'],
      ['\\S', 'escape', '\\S  Non-whitespace'],
      ['\\n', 'escape', '\\n  Newline'],
      ['\\t', 'escape', '\\t  Tab'],
      ['\\r', 'escape', '\\r  Carriage return'],
      ['\\0', 'escape', '\\0  Null char'],
    ]

    table.forEach(([input, kind, label]) => {
      it(`${input} → kind=${kind}, label="${label}"`, () => {
        const node = parseRegex(input)
        expect(node.kind).toBe(kind)
        expect(node.label).toBe(label)
      })
    })

    it('\\b → anchor (word boundary)', () => {
      const node = parseRegex('\\b')
      expect(node.kind).toBe('anchor')
      expect(node.label).toBe('\\b  Word boundary')
    })

    it('\\B → anchor (non-word boundary)', () => {
      const node = parseRegex('\\B')
      expect(node.kind).toBe('anchor')
      expect(node.label).toBe('\\B  Non-word boundary')
    })

    it('\\1 → backreference', () => {
      const node = parseRegex('\\1')
      expect(node.kind).toBe('backreference')
      expect(node.label).toBe('\\1  Backref #1')
    })

    it('\\9 → backreference', () => {
      const node = parseRegex('\\9')
      expect(node.kind).toBe('backreference')
      expect(node.label).toBe('\\9  Backref #9')
    })

    it('\\p{Letter} → Unicode property escape', () => {
      const node = parseRegex('\\p{Letter}')
      expect(node.kind).toBe('escape')
      expect(node.label).toBe('\\p{Letter}  Unicode property')
    })

    it('\\P{L} → negated Unicode property', () => {
      const node = parseRegex('\\P{L}')
      expect(node.kind).toBe('escape')
      expect(node.label).toBe('\\P{L}  Negated Unicode')
    })

    it('\\u{1F600} → Unicode code point', () => {
      const node = parseRegex('\\u{1F600}')
      expect(node.kind).toBe('escape')
      expect(node.label).toBe('\\u{1F600}  Unicode code point')
    })

    it('\\uABCD → 4-hex Unicode char', () => {
      const node = parseRegex('\\uABCD')
      expect(node.kind).toBe('escape')
      expect(node.label).toBe('\\uABCD  Unicode char')
    })

    it('\\. → escaped literal dot', () => {
      const node = parseRegex('\\.')
      expect(node.kind).toBe('literal')
      expect(node.label).toBe('Escaped "."')
    })

    it('trailing backslash → literal', () => {
      const node = parseRegex('\\')
      expect(node.kind).toBe('literal')
      expect(node.raw).toBe('\\')
    })
  })

  describe('groups', () => {
    it('(a) → capturing group #1', () => {
      const node = parseRegex('(a)')
      expect(node.kind).toBe('group')
      expect(node.capturing).toBe(true)
      expect(node.label).toBe('Capture group #1')
      expect(node.children![0].kind).toBe('literal')
    })

    it('(?:a) → non-capturing group', () => {
      const node = parseRegex('(?:a)')
      expect(node.kind).toBe('nonCapturing')
      expect(node.capturing).toBe(false)
      expect(node.label).toBe('Non-capturing')
    })

    it('(?<foo>a) → named capturing group', () => {
      const node = parseRegex('(?<foo>a)')
      expect(node.kind).toBe('group')
      expect(node.name).toBe('foo')
      expect(node.label).toBe('Named group «foo»')
    })

    it('(?=a) → positive lookahead', () => {
      const node = parseRegex('(?=a)')
      expect(node.kind).toBe('lookahead')
      expect(node.negative).toBe(false)
      expect(node.label).toContain('Lookahead')
    })

    it('(?!a) → negative lookahead', () => {
      const node = parseRegex('(?!a)')
      expect(node.kind).toBe('lookahead')
      expect(node.negative).toBe(true)
      expect(node.label).toContain('Neg.')
    })

    it('(?<=a) → positive lookbehind', () => {
      const node = parseRegex('(?<=a)')
      expect(node.kind).toBe('lookbehind')
      expect(node.negative).toBe(false)
      expect(node.label).toContain('Lookbehind')
    })

    it('(?<!a) → negative lookbehind', () => {
      const node = parseRegex('(?<!a)')
      expect(node.kind).toBe('lookbehind')
      expect(node.negative).toBe(true)
      expect(node.label).toContain('Neg.')
    })

    it('(?>a) → atomic group', () => {
      const node = parseRegex('(?>a)')
      expect(node.kind).toBe('atomic')
      expect(node.capturing).toBe(false)
      expect(node.label).toBe('Atomic group (?>…)')
    })

    it('nested groups increment labels correctly', () => {
      const outer = parseRegex('((a))')
      expect(outer.kind).toBe('group')
      expect(outer.label).toBe('Capture group #1')
      const inner = outer.children![0]
      expect(inner.kind).toBe('group')
      expect(inner.label).toBe('Capture group #2')
    })

    it('group with quantifier retains group kind', () => {
      const node = parseRegex('(a)+')
      expect(node.kind).toBe('group')
      expect(node.quantifier!.min).toBe(1)
    })

    it('non-capturing group with quantifier', () => {
      const node = parseRegex('(?:ab)*')
      expect(node.kind).toBe('nonCapturing')
      expect(node.quantifier!.min).toBe(0)
      expect(node.quantifier!.max).toBeNull()
    })
  })

  describe('backreferences', () => {
    it('\\k<foo> → named backreference', () => {
      const node = parseRegex('\\k<foo>')
      expect(node.kind).toBe('backreference')
      expect(node.label).toBe('\\k<foo>  Named backref')
    })

    it('\\k<year> → named backreference with longer name', () => {
      const node = parseRegex('\\k<year>')
      expect(node.kind).toBe('backreference')
      expect(node.label).toBe('\\k<year>  Named backref')
    })
  })

  describe('complex patterns', () => {
    it('^\\d+$ → sequence: anchor, quantified escape, anchor', () => {
      const node = parseRegex('^\\d+$')
      expect(node.kind).toBe('sequence')
      expect(node.children).toHaveLength(3)
      expect(node.children![0].kind).toBe('anchor')  // ^
      expect(node.children![1].kind).toBe('escape')  // \d+
      expect(node.children![2].kind).toBe('anchor')  // $
    })

    it('(a|b)+ → quantified alternation inside group', () => {
      const node = parseRegex('(a|b)+')
      expect(node.kind).toBe('group')
      expect(node.quantifier!.min).toBe(1)
      expect(node.children![0].kind).toBe('alternation')
    })

    it('span covers the full pattern', () => {
      const node = parseRegex('abc')
      expect(node.start).toBe(0)
      expect(node.end).toBe(3)
    })
  })

  describe('error handling', () => {
    it('does not throw on unclosed groups', () => {
      expect(() => parseRegex('(((')).not.toThrow()
    })

    it('does not throw on Python-style named groups', () => {
      expect(() => parseRegex('(?P<name>test)')).not.toThrow()
    })

    it('does not throw on empty alternation branch', () => {
      expect(() => parseRegex('a|')).not.toThrow()
    })

    it('does not throw on unmatched closing paren', () => {
      expect(() => parseRegex('a)')).not.toThrow()
    })
  })
})
