import { SCORED_CELL_IDS } from '../data/cells';
import { QUESTION_BY_ID } from '../data/questions';
import type { HistoryEntry, ScoredCellId } from '../data/types';

export type ScoreBoard = Record<ScoredCellId, number>;

/**
 * 선택 기록(history)에서 점수표를 파생한다. 단일 진실 = history.
 * 점수 5종을 모두 0으로 초기화한 뒤 누적하므로, 안 뽑힌 세포도 키가 보장된다.
 */
export function tally(history: HistoryEntry[]): ScoreBoard {
  const board = Object.fromEntries(
    SCORED_CELL_IDS.map((id) => [id, 0]),
  ) as ScoreBoard;

  for (const { questionId, choiceKey } of history) {
    const question = QUESTION_BY_ID.get(questionId);
    if (!question) continue;
    const choice = question.choices.find((c) => c.key === choiceKey);
    if (!choice) continue;

    for (const [cell, pts] of Object.entries(choice.scores)) {
      board[cell as ScoredCellId] += pts ?? 0;
    }
  }

  return board;
}
