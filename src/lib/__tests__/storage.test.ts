import { describe, it, expect, beforeEach } from 'vitest'
import { loadAppState, saveAppState } from '../storage'
import type { AppState } from '../storage'

const KEY = 'regexcheck_state'

const DEFAULT_PATTERN = '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})'

describe('loadAppState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns defaults when localStorage is empty', () => {
    const state = loadAppState()
    expect(state.pattern).toBe(DEFAULT_PATTERN)
    expect(state.flags).toBe('gd')
    expect(state.rightTab).toBe('diagram')
    expect(state.bottomTab).toBe('matches')
    expect(typeof state.testText).toBe('string')
    expect(typeof state.activePresetId).toBe('string')
  })

  it('merges stored fields with defaults (partial state)', () => {
    localStorage.setItem(KEY, JSON.stringify({ pattern: 'hello', flags: 'gi' }))
    const state = loadAppState()
    expect(state.pattern).toBe('hello')
    expect(state.flags).toBe('gi')
    expect(state.rightTab).toBe('diagram')   // default preserved
    expect(state.bottomTab).toBe('matches')  // default preserved
  })

  it('returns defaults for invalid JSON', () => {
    localStorage.setItem(KEY, '{not valid json}')
    const state = loadAppState()
    expect(state.pattern).toBe(DEFAULT_PATTERN)
  })

  it('returns defaults for null value in storage', () => {
    // localStorage.getItem returns null → JSON.parse not called
    const state = loadAppState()
    expect(state.pattern).toBe(DEFAULT_PATTERN)
  })

  it('overrides all defaults with a fully stored state', () => {
    const stored: AppState = {
      pattern: 'test',
      flags: 'g',
      testText: 'sample text',
      activePresetId: 'email',
      rightTab: 'presets',
      bottomTab: 'reference',
    }
    localStorage.setItem(KEY, JSON.stringify(stored))
    expect(loadAppState()).toMatchObject(stored)
  })
})

describe('saveAppState', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('writes state to localStorage under the correct key', () => {
    const state: AppState = {
      pattern: 'abc',
      flags: 'g',
      testText: 'hello',
      activePresetId: 'email',
      rightTab: 'diagram',
      bottomTab: 'matches',
    }
    saveAppState(state)
    const raw = localStorage.getItem(KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toMatchObject(state)
  })

  it('overwrites a previously saved state', () => {
    const first: AppState = {
      pattern: 'first',
      flags: 'g',
      testText: '',
      activePresetId: '',
      rightTab: 'diagram',
      bottomTab: 'matches',
    }
    const second: AppState = { ...first, pattern: 'second' }
    saveAppState(first)
    saveAppState(second)
    const loaded = loadAppState()
    expect(loaded.pattern).toBe('second')
  })
})

describe('round-trip', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('save then load returns identical state', () => {
    const original: AppState = {
      pattern: '\\d+',
      flags: 'gm',
      testText: '123 456',
      activePresetId: 'ipv4',
      rightTab: 'presets',
      bottomTab: 'reference',
    }
    saveAppState(original)
    expect(loadAppState()).toEqual(original)
  })
})
