import { SCORED_CELL_IDS } from '../data/cells';
import { QUESTION_BY_ID } from '../data/questions';
import { RESULT_BY_CELL } from '../data/results';
import { tally } from './tally';
import type { HistoryEntry, ResultType, ScoredCellId } from '../data/types';

// 동점 3단 규칙의 마지막 안전망(③). "재미있는 유형 우선" 순서.
export const CELL_PRIORITY: ScoredCellId[] = [
  'love',
  'emotion',
  'pride',
  'reason',
  'rest',
];

/**
 * history → 결과유형. 동점은 결정론 3단으로 처리(랜덤 금지):
 *   ① 최고점 세포가 단독이면 그게 결과
 *   ② 동점 → 최근성 가중: history 역순으로 가장 늦게 점수받은 후보
 *   ③ 그래도 동점(후보 전원 0점 등) → 고정 우선순위 배열
 */
export function deriveResult(history: HistoryEntry[]): ResultType {
  const board = tally(history);
  const max = Math.max(...SCORED_CELL_IDS.map((id) => board[id]));
  const candidates = SCORED_CELL_IDS.filter((id) => board[id] === max);

  const winner =
    candidates.length === 1 ? candidates[0] : breakTie(candidates, history);

  // RESULTS는 5세포를 1:1 커버(data.test.ts가 보증)하므로 항상 존재.
  return RESULT_BY_CELL.get(winner)!;
}

/** ② 최근성 가중 → ③ 고정 우선순위 */
function breakTie(
  candidates: ScoredCellId[],
  history: HistoryEntry[],
): ScoredCellId {
  const candSet = new Set(candidates);

  // ② history를 뒤에서 앞으로: 가장 늦게 점수를 준 선택이 가리키는 후보가 이긴다.
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    const question = QUESTION_BY_ID.get(entry.questionId);
    const choice = question?.choices.find((c) => c.key === entry.choiceKey);
    if (!choice) continue;

    const contributed = Object.entries(choice.scores)
      .filter(([cell, pts]) => candSet.has(cell as ScoredCellId) && (pts ?? 0) > 0)
      .map(([cell]) => cell as ScoredCellId);

    // 한 선택이 동점 후보 여럿에 기여하면 그 안에서 우선순위로 결정.
    if (contributed.length > 0) return firstByPriority(contributed);
  }

  // ③ 안전망
  return firstByPriority(candidates);
}

function firstByPriority(ids: ScoredCellId[]): ScoredCellId {
  const set = new Set(ids);
  return CELL_PRIORITY.find((id) => set.has(id)) ?? ids[0];
}
