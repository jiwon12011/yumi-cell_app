import { SCORED_CELL_IDS } from '../data/cells';
import type { Choice, Question, ScoredCellId } from '../data/types';

/** 한 선택의 대표(최고점) 세포. 동점이면 SCORED_CELL_IDS 순서상 먼저. (표시용) */
export function topCellOfChoice(choice: Choice): ScoredCellId {
  let best: ScoredCellId = SCORED_CELL_IDS[0];
  let bestValue = -1;
  for (const id of SCORED_CELL_IDS) {
    const v = choice.scores[id] ?? 0;
    if (v > bestValue) {
      bestValue = v;
      best = id;
    }
  }
  return best;
}

/** 질문 전체에서 가장 크게 반응하는 세포 (배경 틴트용). 두 선택지 점수 합산. */
export function dominantCellOfQuestion(question: Question): ScoredCellId {
  const totals = new Map<ScoredCellId, number>();
  for (const choice of question.choices) {
    for (const id of SCORED_CELL_IDS) {
      totals.set(id, (totals.get(id) ?? 0) + (choice.scores[id] ?? 0));
    }
  }
  let best: ScoredCellId = SCORED_CELL_IDS[0];
  let bestValue = -1;
  for (const id of SCORED_CELL_IDS) {
    const v = totals.get(id) ?? 0;
    if (v > bestValue) {
      bestValue = v;
      best = id;
    }
  }
  return best;
}
