import { describe, expect, it } from 'vitest';
import { CELL_IDS } from '../data/cells';
import { COMMENTS } from '../data/comments';
import { hashString, pickComment } from './pickComment';
import type { Intensity } from './types';

const INTENSITIES: Intensity[] = [1, 2, 3];

describe('COMMENTS 풀', () => {
  it('세포 7 × 강도 3 전 조합에 5줄씩, 전부 40자 이내', () => {
    for (const cellId of CELL_IDS) {
      for (const i of INTENSITIES) {
        const pool = COMMENTS[cellId][i];
        expect(pool, `${cellId}/${i}`).toHaveLength(5);
        for (const line of pool) {
          expect(line.length, `${cellId}/${i}: ${line}`).toBeLessThanOrEqual(40);
          expect(line.trim()).toBe(line);
          expect(line.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('pickComment', () => {
  it('결정적이다 — 같은 입력이면 항상 같은 멘트', () => {
    for (let i = 0; i < 5; i++) {
      expect(pickComment('emotion', 2, '2026-07-02')).toBe(
        pickComment('emotion', 2, '2026-07-02'),
      );
    }
  });

  it('풀 안의 멘트를 반환한다 (전 조합)', () => {
    for (const cellId of CELL_IDS) {
      for (const i of INTENSITIES) {
        const got = pickComment(cellId, i, '2026-07-02');
        expect(COMMENTS[cellId][i]).toContain(got);
      }
    }
  });

  it('날짜가 다르면 멘트가 (대체로) 달라진다 — 30일 중 최소 2종', () => {
    const seen = new Set<string>();
    for (let d = 1; d <= 30; d++) {
      seen.add(pickComment('rest', 2, `2026-06-${String(d).padStart(2, '0')}`));
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it('hashString은 안정적이고 음수가 없다', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('2026-07-02|emotion|2')).toBeGreaterThanOrEqual(0);
    expect(hashString('a')).not.toBe(hashString('b'));
  });
});
