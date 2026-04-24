const KEY = 'regexcheck_state';

export interface AppState {
  pattern:        string;
  flags:          string;
  testText:       string;
  activePresetId: string;
  rightTab:       'diagram' | 'presets';
  bottomTab:      'matches' | 'reference';
}

const DEFAULTS: AppState = {
  pattern:        '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})',
  flags:          'gd',
  testText:       'Today is 2026-04-21\nRelease: 2025-12-31\nInvalid: 2026/01/01',
  activePresetId: 'named-groups-date',
  rightTab:       'diagram',
  bottomTab:      'matches',
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveAppState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}
