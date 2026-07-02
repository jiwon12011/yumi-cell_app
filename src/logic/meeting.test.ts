import { describe, expect, it } from 'vitest';
import { CELL_IDS } from '../data/cells';
import { HANDOVER_LINES, MEETING_LINES, pickMeetingRemarks } from '../data/meeting';

describe('MEETING_LINES 풀', () => {
  it('세포 7종 전부 5줄씩, {name} 치환 전 기준 40자 이내', () => {
    for (const cellId of CELL_IDS) {
      const pool = MEETING_LINES[cellId];
      expect(pool, cellId).toHaveLength(5);
      for (const line of pool) {
        expect(line.length, `${cellId}: ${line}`).toBeLessThanOrEqual(40);
        expect(line).toContain('{name}');
      }
    }
  });
});

describe('pickMeetingRemarks', () => {
  it('결정적이다 — 같은 (의장, 날짜)면 같은 장면', () => {
    expect(pickMeetingRemarks('emotion', '2026-07-02')).toEqual(
      pickMeetingRemarks('emotion', '2026-07-02'),
    );
  });

  it('발언자 2명은 서로 다르고 의장이 아니다 (전 의장 × 30일)', () => {
    for (const chair of CELL_IDS) {
      for (let d = 1; d <= 30; d++) {
        const date = `2026-06-${String(d).padStart(2, '0')}`;
        const [a, b] = pickMeetingRemarks(chair, date);
        expect(a.speaker).not.toBe(chair);
        expect(b.speaker).not.toBe(chair);
        expect(a.speaker).not.toBe(b.speaker);
      }
    }
  });

  it('발언에 {name} 플레이스홀더가 남지 않고 의장 이름이 들어간다', () => {
    const [a, b] = pickMeetingRemarks('rest', '2026-07-02');
    for (const r of [a, b]) {
      expect(r.line).not.toContain('{name}');
      expect(r.line).toContain('휴식');
    }
  });

  it('어제 의장이 다르면 첫 발언은 어제 의장의 인수인계', () => {
    const [a, b] = pickMeetingRemarks('emotion', '2026-07-02', 'pride');
    expect(a.speaker).toBe('pride');
    expect(a.line).toContain('감성');
    expect(a.line).not.toContain('{name}');
    expect(b.speaker).not.toBe('emotion');
    expect(b.speaker).not.toBe('pride');
  });

  it('어제 의장이 오늘과 같으면 일반 경로 (인수인계 없음)', () => {
    expect(pickMeetingRemarks('rest', '2026-07-02', 'rest')).toEqual(
      pickMeetingRemarks('rest', '2026-07-02'),
    );
  });
});

describe('HANDOVER_LINES', () => {
  it('세포 7종 전부 존재, {name} 포함, 40자 이내', () => {
    for (const cellId of CELL_IDS) {
      const line = HANDOVER_LINES[cellId];
      expect(line, cellId).toContain('{name}');
      expect(line.length).toBeLessThanOrEqual(40);
    }
  });
});
