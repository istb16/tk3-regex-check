import { describe, it, expect } from 'vitest'
import { translations } from '../i18n.svelte'

const en = translations.en
const ja = translations.ja

describe('translations.en', () => {
  describe('tabs.matches(n)', () => {
    it('returns label without count when n=0', () => {
      expect(en.tabs.matches(0)).toBe('Matches')
    })

    it('returns label with count when n>0', () => {
      expect(en.tabs.matches(1)).toBe('Matches (1)')
      expect(en.tabs.matches(42)).toBe('Matches (42)')
    })
  })

  describe('regex.matchCount(n)', () => {
    it('singular for n=1', () => {
      expect(en.regex.matchCount(1)).toBe('1 match')
    })

    it('plural for n=0', () => {
      expect(en.regex.matchCount(0)).toBe('0 matches')
    })

    it('plural for n>1', () => {
      expect(en.regex.matchCount(2)).toBe('2 matches')
      expect(en.regex.matchCount(100)).toBe('100 matches')
    })
  })

  describe('matches.fullMatch(n)', () => {
    it('includes match number', () => {
      expect(en.matches.fullMatch(1)).toBe('Full match (#1)')
      expect(en.matches.fullMatch(5)).toBe('Full match (#5)')
    })
  })

  describe('test.tooLarge(chars)', () => {
    it('includes the char count in the message', () => {
      const msg = en.test.tooLarge('50,000')
      expect(msg).toContain('50,000')
    })
  })

  describe('static strings', () => {
    it('has non-empty header subtitle', () => {
      expect(en.header.subtitle.length).toBeGreaterThan(0)
    })

    it('has all flag tooltip entries', () => {
      const flags = ['g', 'i', 'm', 's', 'u', 'v', 'd', 'y']
      for (const f of flags) {
        expect(typeof en.flagTooltips[f]).toBe('string')
        expect(en.flagTooltips[f].length).toBeGreaterThan(0)
      }
    })
  })
})

describe('translations.ja', () => {
  describe('tabs.matches(n)', () => {
    it('returns Japanese label without count when n=0', () => {
      expect(ja.tabs.matches(0)).toBe('マッチ一覧')
    })

    it('returns Japanese label with count when n>0', () => {
      expect(ja.tabs.matches(5)).toBe('マッチ一覧 (5)')
    })
  })

  describe('regex.matchCount(n)', () => {
    it('returns Japanese count string', () => {
      expect(ja.regex.matchCount(3)).toBe('3 件マッチ')
      expect(ja.regex.matchCount(1)).toBe('1 件マッチ')
    })
  })

  describe('matches.fullMatch(n)', () => {
    it('uses Japanese label with match number', () => {
      expect(ja.matches.fullMatch(2)).toBe('完全一致 (#2)')
    })
  })

  describe('both locales share the same structure', () => {
    it('en and ja have the same top-level keys', () => {
      expect(Object.keys(en).sort()).toEqual(Object.keys(ja).sort())
    })
  })
})
