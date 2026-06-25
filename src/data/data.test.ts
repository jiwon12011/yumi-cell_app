import { describe, it, expect } from 'vitest';
import { CELLS, SCORED_CELL_IDS } from './cells';
import { QUESTIONS } from './questions';
import { RESULTS } from './results';
import { FORTUNES, getFortune } from './fortunes';
import { tally } from '../logic/tally';
import { deriveResult, CELL_PRIORITY } from '../logic/deriveResult';
import type { HistoryEntry, ScoredCellId } from './types';

const VALID_CELL_IDS = new Set(CELLS.map((c) => c.id));
const SCORED_SET = new Set<ScoredCellId>(SCORED_CELL_IDS);

describe('결과유형 ↔ 점수세포 매핑', () => {
  it('결과 5종이 점수 세포 5종을 1:1 빠짐없이 커버한다', () => {
    expect(RESULTS).toHaveLength(SCORED_CELL_IDS.length);
    const covered = RESULTS.map((r) => r.cell).sort();
    expect(covered).toEqual([...SCORED_CELL_IDS].sort());
  });

  it('각 결과의 id와 cell이 일치하고 점수 세포다', () => {
    for (const r of RESULTS) {
      expect(r.id).toBe(r.cell);
      expect(SCORED_SET.has(r.cell)).toBe(true);
    }
  });
});

describe('질문 데이터 무결성', () => {
  it('질문이 7개, index가 1..7로 정렬돼 있다', () => {
    expect(QUESTIONS).toHaveLength(7);
    QUESTIONS.forEach((q, i) => expect(q.index).toBe(i + 1));
  });

  it('모든 질문이 A/B 정확히 2개 선택지를 가진다', () => {
    for (const q of QUESTIONS) {
      expect(q.choices.map((c) => c.key)).toEqual(['A', 'B']);
    }
  });

  it('모든 choice.scores 키가 유효한 점수 세포다', () => {
    for (const q of QUESTIONS) {
      for (const choice of q.choices) {
        for (const key of Object.keys(choice.scores)) {
          expect(SCORED_SET.has(key as ScoredCellId)).toBe(true);
        }
      }
    }
  });

  it('모든 reaction.cell이 유효한 세포(점수+분위기 7종)다', () => {
    for (const q of QUESTIONS) {
      for (const choice of q.choices) {
        for (const reaction of choice.reactions) {
          expect(VALID_CELL_IDS.has(reaction.cell)).toBe(true);
        }
      }
    }
  });
});

describe('고립 유형 없음 — 5세포 각각 단독 1위 경로 존재', () => {
  // 7문항 × A/B = 128 조합 전수 탐색.
  function allHistories(): HistoryEntry[][] {
    const n = QUESTIONS.length;
    const out: HistoryEntry[][] = [];
    for (let mask = 0; mask < 1 << n; mask++) {
      out.push(
        QUESTIONS.map((q, i) => ({
          questionId: q.id,
          choiceKey: mask & (1 << i) ? 'B' : 'A',
        })),
      );
    }
    return out;
  }

  it('점수 5세포 모두 어떤 답안 조합에선 단독 최다가 된다', () => {
    const soleWinners = new Set<ScoredCellId>();
    for (const history of allHistories()) {
      const board = tally(history);
      const max = Math.max(...SCORED_CELL_IDS.map((id) => board[id]));
      const top = SCORED_CELL_IDS.filter((id) => board[id] === max);
      if (top.length === 1) soleWinners.add(top[0]);
    }
    for (const id of SCORED_CELL_IDS) {
      expect(soleWinners.has(id)).toBe(true);
    }
  });
});

describe('deriveResult 동점 결정론 규칙', () => {
  it('① 단독 최고점이면 그 세포가 결과 (q4A → pride)', () => {
    const history: HistoryEntry[] = [{ questionId: 'q4', choiceKey: 'A' }];
    expect(deriveResult(history).cell).toBe('pride');
  });

  it('② 동점 시 최근(마지막) 선택이 가리키는 세포 — q1A가 마지막이면 rest', () => {
    // q2B={reason:2}, q1A={rest:2,emotion:1} → reason 2, rest 2 동점. 마지막=q1A → rest
    const history: HistoryEntry[] = [
      { questionId: 'q2', choiceKey: 'B' },
      { questionId: 'q1', choiceKey: 'A' },
    ];
    expect(deriveResult(history).cell).toBe('rest');
  });

  it('② 같은 점수라도 순서가 바뀌면 결과가 바뀐다 — q2B가 마지막이면 reason', () => {
    const history: HistoryEntry[] = [
      { questionId: 'q1', choiceKey: 'A' },
      { questionId: 'q2', choiceKey: 'B' },
    ];
    expect(deriveResult(history).cell).toBe('reason');
  });

  it('③ 전원 0점(빈 history) → 고정 우선순위 첫 번째(love)', () => {
    expect(deriveResult([]).cell).toBe(CELL_PRIORITY[0]);
    expect(deriveResult([]).cell).toBe('love');
  });
});

describe('오늘의 세포 운세', () => {
  it('점수 세포마다 운세가 10개씩 있다', () => {
    for (const id of SCORED_CELL_IDS) {
      expect(FORTUNES[id]).toHaveLength(10);
    }
  });

  it('날짜해시로 결정론적이다 (같은 날 = 같은 운세)', () => {
    const d = new Date(2026, 5, 25); // 2026-06-25 → 20260625 % 10 = 5
    expect(getFortune('rest', d)).toBe(FORTUNES.rest[5]);
    expect(getFortune('rest', d)).toBe(getFortune('rest', d));
  });
});
