import { describe, it, expect } from 'vitest'
import { buildMatches, buildSegments, getMatchColor, groupColor, GROUP_COLORS } from '../highlighter'
import type { MatchResult } from '../types'

describe('buildMatches', () => {
  it('returns empty result for empty pattern', () => {
    const r = buildMatches('', 'g', 'hello')
    expect(r.matches).toEqual([])
    expect(r.error).toBeNull()
    expect(r.elapsed).toBe(0)
  })

  it('returns empty result for empty text', () => {
    const r = buildMatches('a', 'g', '')
    expect(r.matches).toEqual([])
    expect(r.error).toBeNull()
    expect(r.elapsed).toBe(0)
  })

  it('finds all matches in text', () => {
    const r = buildMatches('a', 'g', 'banana')
    expect(r.error).toBeNull()
    expect(r.matches).toHaveLength(3)
    expect(r.matches[0]).toMatchObject({ value: 'a', start: 1, end: 2, index: 1 })
    expect(r.matches[1]).toMatchObject({ value: 'a', start: 3, end: 4 })
    expect(r.matches[2]).toMatchObject({ value: 'a', start: 5, end: 6 })
  })

  it('adds g flag automatically when missing', () => {
    const r = buildMatches('a', '', 'banana')
    expect(r.matches).toHaveLength(3)
  })

  it('returns error for invalid regex pattern', () => {
    const r = buildMatches('[invalid', 'g', 'test')
    expect(r.error).not.toBeNull()
    expect(typeof r.error).toBe('string')
    expect(r.matches).toEqual([])
  })

  it('records non-negative elapsed time', () => {
    const r = buildMatches('a', 'g', 'banana')
    expect(r.elapsed).toBeGreaterThanOrEqual(0)
  })

  it('match result has correct index/value/start/end', () => {
    const r = buildMatches('hello', 'g', 'say hello world')
    expect(r.matches[0]).toMatchObject({ index: 4, value: 'hello', start: 4, end: 9 })
  })

  describe('capture groups — fallback path (no d flag)', () => {
    it('returns groups array for each match', () => {
      const r = buildMatches('(a)(b)', 'g', 'ab')
      expect(r.error).toBeNull()
      expect(r.matches).toHaveLength(1)
      expect(r.matches[0].groups).toHaveLength(2)
    })

    it('group values are correct', () => {
      const r = buildMatches('(a)(b)', 'g', 'ab')
      expect(r.matches[0].groups[0].value).toBe('a')
      expect(r.matches[0].groups[1].value).toBe('b')
    })

    it('group indices are 1-based', () => {
      const r = buildMatches('(a)(b)', 'g', 'ab')
      expect(r.matches[0].groups[0].index).toBe(1)
      expect(r.matches[0].groups[1].index).toBe(2)
    })
  })

  describe('capture groups — indices path (d flag)', () => {
    it('returns groups with correct start/end from indices', () => {
      const r = buildMatches('(a)(b)', 'gd', 'ab')
      expect(r.error).toBeNull()
      expect(r.matches[0].groups[0]).toMatchObject({ index: 1, value: 'a', start: 0, end: 1 })
      expect(r.matches[0].groups[1]).toMatchObject({ index: 2, value: 'b', start: 1, end: 2 })
    })

    it('resolves named group name via reference identity', () => {
      const r = buildMatches('(?<year>\\d{4})', 'gd', '2026')
      expect(r.error).toBeNull()
      expect(r.matches[0].groups).toHaveLength(1)
      expect(r.matches[0].groups[0].value).toBe('2026')
      expect(r.matches[0].groups[0].name).toBe('year')
    })
  })

  it('handles zero-length matches without hanging', () => {
    const r = buildMatches('a*', 'g', 'b')
    expect(r.error).toBeNull()
    expect(r.matches.length).toBeGreaterThan(0)
  })

  it('caps iterations at 500', () => {
    const r = buildMatches('a?', 'g', 'a'.repeat(600))
    expect(r.matches.length).toBeLessThanOrEqual(500)
  })

  it('case-insensitive flag works', () => {
    const r = buildMatches('hello', 'gi', 'Hello HELLO hello')
    expect(r.matches).toHaveLength(3)
  })
})

describe('getMatchColor', () => {
  it('returns a non-empty string', () => {
    expect(typeof getMatchColor(0)).toBe('string')
    expect(getMatchColor(0).length).toBeGreaterThan(0)
  })

  it('index 0 and index 6 return the same color (wraps at 6)', () => {
    expect(getMatchColor(0)).toBe(getMatchColor(6))
    expect(getMatchColor(1)).toBe(getMatchColor(7))
    expect(getMatchColor(5)).toBe(getMatchColor(11))
  })

  it('adjacent indices return different colors', () => {
    expect(getMatchColor(0)).not.toBe(getMatchColor(1))
    expect(getMatchColor(2)).not.toBe(getMatchColor(3))
  })
})

describe('groupColor', () => {
  it('returns a non-empty string', () => {
    expect(typeof groupColor(1)).toBe('string')
    expect(groupColor(1).length).toBeGreaterThan(0)
  })

  it('index 1 maps to the first GROUP_COLOR entry', () => {
    expect(groupColor(1)).toBe(GROUP_COLORS[0])
  })

  it('index 2 maps to the second GROUP_COLOR entry', () => {
    expect(groupColor(2)).toBe(GROUP_COLORS[1])
  })

  it('wraps around after GROUP_COLORS.length', () => {
    expect(groupColor(1)).toBe(groupColor(1 + GROUP_COLORS.length))
  })
})

describe('buildSegments', () => {
  it('returns single segment when there are no matches', () => {
    const segs = buildSegments('hello', [])
    expect(segs).toHaveLength(1)
    expect(segs[0]).toMatchObject({ text: 'hello', matchIndex: -1, groupIndex: -1, isStart: true })
  })

  it('empty text with no matches returns single empty segment', () => {
    const segs = buildSegments('', [])
    expect(segs).toHaveLength(1)
    expect(segs[0].text).toBe('')
  })

  it('single mid-text match produces three segments', () => {
    const match: MatchResult = { index: 1, value: 'b', groups: [], start: 1, end: 2 }
    const segs = buildSegments('abc', [match])
    expect(segs).toHaveLength(3)
    expect(segs[0]).toMatchObject({ text: 'a', matchIndex: -1 })
    expect(segs[1]).toMatchObject({ text: 'b', matchIndex: 0, isStart: true })
    expect(segs[2]).toMatchObject({ text: 'c', matchIndex: -1 })
  })

  it('match at start of text produces two segments', () => {
    const match: MatchResult = { index: 0, value: 'ab', groups: [], start: 0, end: 2 }
    const segs = buildSegments('abc', [match])
    expect(segs).toHaveLength(2)
    expect(segs[0]).toMatchObject({ text: 'ab', matchIndex: 0, isStart: true })
    expect(segs[1]).toMatchObject({ text: 'c', matchIndex: -1 })
  })

  it('match at end of text produces two segments', () => {
    const match: MatchResult = { index: 1, value: 'bc', groups: [], start: 1, end: 3 }
    const segs = buildSegments('abc', [match])
    expect(segs).toHaveLength(2)
    expect(segs[0]).toMatchObject({ text: 'a', matchIndex: -1 })
    expect(segs[1]).toMatchObject({ text: 'bc', matchIndex: 0 })
  })

  it('full-text match produces one segment', () => {
    const match: MatchResult = { index: 0, value: 'abc', groups: [], start: 0, end: 3 }
    const segs = buildSegments('abc', [match])
    expect(segs).toHaveLength(1)
    expect(segs[0]).toMatchObject({ text: 'abc', matchIndex: 0 })
  })

  it('two non-adjacent matches produce five segments', () => {
    const matches: MatchResult[] = [
      { index: 0, value: 'a', groups: [], start: 0, end: 1 },
      { index: 2, value: 'a', groups: [], start: 2, end: 3 },
    ]
    const segs = buildSegments('aba', matches)
    expect(segs).toHaveLength(3)
    expect(segs[0]).toMatchObject({ text: 'a', matchIndex: 0 })
    expect(segs[1]).toMatchObject({ text: 'b', matchIndex: -1 })
    expect(segs[2]).toMatchObject({ text: 'a', matchIndex: 1 })
  })

  it('isStart is true for the first segment of each match', () => {
    const matches: MatchResult[] = [
      { index: 0, value: 'aa', groups: [], start: 0, end: 2 },
      { index: 3, value: 'aa', groups: [], start: 3, end: 5 },
    ]
    const segs = buildSegments('aa_aa', matches)
    const matchSegs = segs.filter(s => s.matchIndex >= 0)
    expect(matchSegs.every(s => s.isStart)).toBe(true)
  })

  it('capture group sets groupIndex on its sub-segment', () => {
    const match: MatchResult = {
      index: 0,
      value: 'ab',
      groups: [{ index: 1, value: 'a', start: 0, end: 1 }],
      start: 0,
      end: 2,
    }
    const segs = buildSegments('ab', [match])
    const groupSeg = segs.find(s => s.groupIndex === 1)
    expect(groupSeg).toBeDefined()
    expect(groupSeg!.text).toBe('a')
  })

  it('close events are sorted before open events at same position', () => {
    // Adjacent matches: no gap between end of m0 and start of m1
    const matches: MatchResult[] = [
      { index: 0, value: 'a', groups: [], start: 0, end: 1 },
      { index: 1, value: 'b', groups: [], start: 1, end: 2 },
    ]
    const segs = buildSegments('ab', matches)
    expect(segs).toHaveLength(2)
    expect(segs[0]).toMatchObject({ text: 'a', matchIndex: 0 })
    expect(segs[1]).toMatchObject({ text: 'b', matchIndex: 1 })
  })
})
