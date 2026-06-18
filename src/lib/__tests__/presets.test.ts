import { describe, it, expect } from 'vitest'
import { presets, categories } from '../presets'

describe('presets', () => {
  it('contains at least one preset', () => {
    expect(presets.length).toBeGreaterThan(0)
  })

  it('every preset has required string fields', () => {
    for (const p of presets) {
      expect(typeof p.id, `${p.id}.id`).toBe('string')
      expect(p.id.length, `${p.id} id is empty`).toBeGreaterThan(0)
      expect(typeof p.name, `${p.id}.name`).toBe('string')
      expect(p.name.length, `${p.id} name is empty`).toBeGreaterThan(0)
      expect(typeof p.pattern, `${p.id}.pattern`).toBe('string')
      expect(typeof p.flags, `${p.id}.flags`).toBe('string')
      expect(typeof p.category, `${p.id}.category`).toBe('string')
      expect(typeof p.description, `${p.id}.description`).toBe('string')
      expect(typeof p.testText, `${p.id}.testText`).toBe('string')
    }
  })

  it('preset IDs are unique', () => {
    const ids = presets.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('non-AI-generated presets have valid JavaScript regex patterns', () => {
    for (const p of presets) {
      if (!p.aiGenerated) {
        expect(
          () => new RegExp(p.pattern, p.flags),
          `preset "${p.id}" pattern "${p.pattern}" is invalid`,
        ).not.toThrow()
      }
    }
  })

  it('flags contain only valid JavaScript regex flag characters', () => {
    const valid = new Set(['g', 'i', 'm', 's', 'u', 'v', 'd', 'y'])
    for (const p of presets) {
      for (const flag of p.flags) {
        expect(valid.has(flag), `preset "${p.id}" has unknown flag "${flag}"`).toBe(true)
      }
    }
  })

  it('aiGenerated flag is boolean when present', () => {
    for (const p of presets) {
      if ('aiGenerated' in p) {
        expect(typeof p.aiGenerated).toBe('boolean')
      }
    }
  })
})

describe('categories', () => {
  it('is non-empty', () => {
    expect(categories.length).toBeGreaterThan(0)
  })

  it('has no duplicate entries', () => {
    expect(new Set(categories).size).toBe(categories.length)
  })

  it('covers every category that appears in presets', () => {
    const presetCategories = new Set(presets.map(p => p.category))
    for (const cat of presetCategories) {
      expect(categories, `category "${cat}" missing from categories`).toContain(cat)
    }
  })

  it('contains no category that is absent from presets', () => {
    const presetCategories = new Set(presets.map(p => p.category))
    for (const cat of categories) {
      expect(presetCategories.has(cat), `"${cat}" is in categories but no preset uses it`).toBe(true)
    }
  })
})
