import { describe, expect, it } from 'vitest';
import { clampNote, deserialize, emptyStore, serialize } from './entriesStore';
import type { DiaryEntry, StoreV1 } from './types';

function entry(date: string, over: Partial<DiaryEntry> = {}): DiaryEntry {
  return {
    date,
    cellId: 'emotion',
    poseIndex: 1,
    intensity: 2,
    note: '오늘 한 줄',
    createdAt: 1000,
    updatedAt: 2000,
    ...over,
  };
}

describe('clampNote', () => {
  it('trim + 80자 제한', () => {
    expect(clampNote('  안녕  ')).toBe('안녕');
    expect(clampNote('가'.repeat(100))).toHaveLength(80);
  });

  it('이모지(서로게이트 페어)를 반 토막 내지 않는다', () => {
    const s = '😀'.repeat(81);
    const out = clampNote(s);
    expect(Array.from(out)).toHaveLength(80);
    expect(out.endsWith('😀')).toBe(true);
  });
});

describe('serialize/deserialize', () => {
  it('라운드트립이 보존된다', () => {
    const store: StoreV1 = {
      version: 1,
      onboarded: true,
      userName: '지원',
      entries: { '2026-07-02': entry('2026-07-02') },
    };
    expect(deserialize(serialize(store))).toEqual(store);
  });

  it('userName이 없던 구버전 데이터는 빈 이름으로 복원, 긴 이름은 12자 클램프', () => {
    const legacy = JSON.stringify({ version: 1, onboarded: true, entries: {} });
    expect(deserialize(legacy).userName).toBe('');
    const long = JSON.stringify({ userName: '가'.repeat(30), entries: {} });
    expect(deserialize(long).userName).toHaveLength(12);
  });

  it('null/빈 문자열/깨진 JSON → 빈 스토어 (크래시 금지)', () => {
    expect(deserialize(null)).toEqual(emptyStore());
    expect(deserialize('')).toEqual(emptyStore());
    expect(deserialize('{oops')).toEqual(emptyStore());
    expect(deserialize('42')).toEqual(emptyStore());
  });

  it('알 수 없는 cellId 항목은 드롭, 유효 항목은 유지', () => {
    const raw = JSON.stringify({
      version: 1,
      onboarded: false,
      entries: {
        '2026-07-01': entry('2026-07-01', { cellId: 'hunger' as never }),
        '2026-07-02': entry('2026-07-02'),
      },
    });
    const store = deserialize(raw);
    expect(Object.keys(store.entries)).toEqual(['2026-07-02']);
  });

  it('범위 밖 poseIndex/intensity, 키-date 불일치 항목은 드롭', () => {
    const raw = JSON.stringify({
      entries: {
        '2026-07-01': entry('2026-07-01', { poseIndex: 9 as never }),
        '2026-07-02': entry('2026-07-02', { intensity: 0 as never }),
        '2026-07-03': entry('2026-07-04'), // 키와 date 불일치
      },
    });
    expect(Object.keys(deserialize(raw).entries)).toEqual([]);
  });

  it('80자 초과 노트는 클램프해서 복원', () => {
    const raw = JSON.stringify({
      entries: { '2026-07-02': entry('2026-07-02', { note: '가'.repeat(200) }) },
    });
    expect(deserialize(raw).entries['2026-07-02'].note).toHaveLength(80);
  });
});
