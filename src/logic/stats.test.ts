import { describe, expect, it } from 'vitest';
import { CELL_IDS } from '../data/cells';
import {
  chairStreak,
  currentStreak,
  longestStreak,
  monthDistribution,
  topCellOfMonth,
} from './stats';
import type { CellId, DiaryEntry, EntriesMap } from './types';

let seq = 0;
function make(dates: Array<[string, CellId]>): EntriesMap {
  const entries: EntriesMap = {};
  for (const [date, cellId] of dates) {
    const e: DiaryEntry = {
      date,
      cellId,
      poseIndex: 1,
      intensity: 2,
      note: '',
      createdAt: ++seq,
      updatedAt: seq,
    };
    entries[date] = e;
  }
  return entries;
}

describe('monthDistribution', () => {
  it('빈 달은 전부 0', () => {
    const dist = monthDistribution({}, '2026-07');
    expect(dist).toHaveLength(7);
    expect(dist.every((d) => d.count === 0 && d.percent === 0)).toBe(true);
    expect(dist.map((d) => d.cellId)).toEqual(CELL_IDS);
  });

  it('다른 달 기록은 세지 않는다', () => {
    const entries = make([
      ['2026-06-30', 'emotion'],
      ['2026-07-01', 'reason'],
    ]);
    const dist = monthDistribution(entries, '2026-07');
    expect(dist.find((d) => d.cellId === 'emotion')!.count).toBe(0);
    expect(dist.find((d) => d.cellId === 'reason')!.count).toBe(1);
  });

  it('percent 합은 항상 100 (3분할 33/33/34 보정)', () => {
    const entries = make([
      ['2026-07-01', 'emotion'],
      ['2026-07-02', 'reason'],
      ['2026-07-03', 'love'],
    ]);
    const dist = monthDistribution(entries, '2026-07');
    expect(dist.reduce((s, d) => s + d.percent, 0)).toBe(100);
    expect(dist.filter((d) => d.count === 0).every((d) => d.percent === 0)).toBe(true);
  });
});

describe('topCellOfMonth', () => {
  it('기록 없으면 null', () => {
    expect(topCellOfMonth({}, '2026-07')).toBeNull();
  });

  it('최다 세포를 고른다', () => {
    const entries = make([
      ['2026-07-01', 'rest'],
      ['2026-07-02', 'rest'],
      ['2026-07-03', 'love'],
    ]);
    expect(topCellOfMonth(entries, '2026-07')).toBe('rest');
  });

  it('동률이면 더 최근에 기록한 세포', () => {
    const entries = make([
      ['2026-07-01', 'rest'],
      ['2026-07-02', 'love'], // 나중에 기록됨 (updatedAt 큼)
    ]);
    expect(topCellOfMonth(entries, '2026-07')).toBe('love');
  });
});

describe('currentStreak', () => {
  it('빈 맵 = 0', () => {
    expect(currentStreak({}, '2026-07-02')).toBe(0);
  });

  it('오늘 기록 포함 연속', () => {
    const entries = make([
      ['2026-06-30', 'rest'],
      ['2026-07-01', 'rest'],
      ['2026-07-02', 'rest'],
    ]);
    expect(currentStreak(entries, '2026-07-02')).toBe(3); // 월 경계 포함
  });

  it('오늘 미기록이면 어제까지의 연속을 유지', () => {
    const entries = make([
      ['2026-07-01', 'rest'],
      ['2026-06-30', 'rest'],
    ]);
    expect(currentStreak(entries, '2026-07-02')).toBe(2);
  });

  it('어제도 오늘도 없으면 0', () => {
    const entries = make([['2026-06-28', 'rest']]);
    expect(currentStreak(entries, '2026-07-02')).toBe(0);
  });
});

describe('chairStreak', () => {
  it('같은 세포 연속일만 센다 (다른 세포가 끼면 끊김)', () => {
    const entries = make([
      ['2026-06-29', 'rest'],
      ['2026-06-30', 'emotion'],
      ['2026-07-01', 'emotion'],
      ['2026-07-02', 'emotion'],
    ]);
    expect(chairStreak(entries, '2026-07-02')).toBe(3);
    expect(chairStreak(entries, '2026-06-29')).toBe(1);
    expect(chairStreak(entries, '2026-07-03')).toBe(0); // 기록 없음
  });
});

describe('longestStreak', () => {
  it('공백 구간을 나눠 최장을 찾는다', () => {
    const entries = make([
      ['2026-07-01', 'rest'],
      ['2026-07-02', 'rest'],
      // 공백
      ['2026-07-05', 'love'],
      ['2026-07-06', 'love'],
      ['2026-07-07', 'love'],
    ]);
    expect(longestStreak(entries)).toBe(3);
    expect(longestStreak({})).toBe(0);
  });
});
