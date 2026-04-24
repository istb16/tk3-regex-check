import type { MatchResult, TextSegment } from './types';

export function buildMatches(
  pattern: string,
  flags: string,
  text: string
): { matches: MatchResult[]; error: string | null; elapsed: number } {
  if (!pattern || !text) return { matches: [], error: null, elapsed: 0 };

  const t0 = performance.now();
  try {
    const safeFlags = flags.includes('g') ? flags : flags + 'g';
    const re = new RegExp(pattern, safeFlags);

    const results: MatchResult[] = [];
    let m: RegExpExecArray | null;
    let iterations = 0;

    while ((m = re.exec(text)) !== null && iterations < 500) {
      const groups: MatchResult['groups'] = [];

      if (m.indices) {
        for (let i = 1; i < m.indices.length; i++) {
          const idx = m.indices[i];
          if (idx) {
            const name = Object.entries(m.indices.groups ?? {}).find(([, v]) => v === idx)?.[0];
            groups.push({ index: i, value: m[i] ?? '', name, start: idx[0], end: idx[1] });
          }
        }
      } else {
        let offset = m.index;
        for (let i = 1; i < m.length; i++) {
          if (m[i] !== undefined) {
            const name = m.groups
              ? Object.entries(m.groups).find(([, v]) => v === m![i])?.[0]
              : undefined;
            const start = text.indexOf(m[i], offset);
            groups.push({ index: i, value: m[i], name, start, end: start + m[i].length });
            offset = start;
          }
        }
      }

      results.push({ index: m.index, value: m[0], groups, start: m.index, end: m.index + m[0].length });

      if (m[0].length === 0) re.lastIndex++;
      iterations++;
    }

    const elapsed = performance.now() - t0;
    return { matches: results, error: null, elapsed };
  } catch (e) {
    return { matches: [], error: (e as Error).message, elapsed: 0 };
  }
}

const MATCH_COLORS = [
  'rgba(124,58,237,0.3)',   // violet
  'rgba(6,182,212,0.3)',    // cyan
  'rgba(16,185,129,0.3)',   // emerald
  'rgba(245,158,11,0.3)',   // amber
  'rgba(239,68,68,0.3)',    // red
  'rgba(236,72,153,0.3)',   // pink
];

export const GROUP_COLORS = [
  '#c084fc', // purple-400
  '#22d3ee', // cyan-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#f87171', // red-400
  '#f472b6', // pink-400
];

export function getMatchColor(index: number): string {
  return MATCH_COLORS[index % MATCH_COLORS.length];
}

export function groupColor(index: number): string {
  return GROUP_COLORS[(index - 1) % GROUP_COLORS.length];
}

export function buildSegments(text: string, matches: MatchResult[]): TextSegment[] {
  if (!matches.length) {
    return [{ text, matchIndex: -1, groupIndex: -1, isStart: true }];
  }

  type Event = { pos: number; open: boolean; matchIndex: number; groupIndex: number };
  const events: Event[] = [];

  matches.forEach((match, mi) => {
    events.push({ pos: match.start, open: true, matchIndex: mi, groupIndex: -1 });
    events.push({ pos: match.end, open: false, matchIndex: mi, groupIndex: -1 });
    match.groups.forEach((g) => {
      events.push({ pos: g.start, open: true, matchIndex: mi, groupIndex: g.index });
      events.push({ pos: g.end, open: false, matchIndex: mi, groupIndex: g.index });
    });
  });

  // Close events must be processed before open events at the same position,
  // otherwise an adjacent match's open event gets wiped by the preceding close.
  events.sort((a, b) => a.pos - b.pos || (a.open ? 1 : -1));

  const segments: TextSegment[] = [];
  let pos = 0;
  let currentMatch = -1;
  let currentGroup = -1;

  const addSegment = (end: number) => {
    if (end > pos) {
      segments.push({
        text: text.slice(pos, end),
        matchIndex: currentMatch,
        groupIndex: currentGroup,
        isStart: segments.length === 0 || segments[segments.length - 1].matchIndex !== currentMatch,
      });
      pos = end;
    }
  };

  for (const ev of events) {
    addSegment(ev.pos);
    if (ev.open) {
      if (ev.groupIndex !== -1) currentGroup = ev.groupIndex;
      else currentMatch = ev.matchIndex;
    } else {
      if (ev.groupIndex !== -1) currentGroup = -1;
      else { currentMatch = -1; currentGroup = -1; }
    }
  }

  addSegment(text.length);
  return segments;
}
