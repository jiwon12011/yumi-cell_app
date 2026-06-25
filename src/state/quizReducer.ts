import { QUESTIONS } from '../data/questions';
import { SCORED_CELL_IDS } from '../data/cells';
import type { ChoiceKey, HistoryEntry, ScoredCellId } from '../data/types';

export type Phase = 'splash' | 'intro' | 'question' | 'reaction' | 'result';

export interface QuizState {
  phase: Phase;
  /** 단일 진실. 점수·진행도·결과는 전부 여기서 파생(tally/deriveResult). */
  history: HistoryEntry[];
  /** reaction 화면에서 보여줄 직전 선택 */
  pendingChoice: ChoiceKey | null;
  /** ?r= 딥링크로 바로 결과 진입한 경우의 세포 (없으면 null = history에서 파생) */
  deepLinkCell: ScoredCellId | null;
}

export type QuizAction =
  | { type: 'START' } // 수동 화면(splash/intro) 진행
  | { type: 'CHOOSE'; choiceKey: ChoiceKey }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'RESTART' };

const SCORED_SET = new Set<string>(SCORED_CELL_IDS);

/** URL ?r= 를 읽어 초기 상태 결정. 유효한 점수 세포면 결과 화면으로 바로 부팅. */
export function initState(): QuizState {
  const base: QuizState = {
    phase: 'splash',
    history: [],
    pendingChoice: null,
    deepLinkCell: null,
  };
  if (typeof window === 'undefined') return base;
  const r = new URLSearchParams(window.location.search).get('r');
  if (r && SCORED_SET.has(r)) {
    return { ...base, phase: 'result', deepLinkCell: r as ScoredCellId };
  }
  return base;
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START': {
      // splash → intro, intro → 첫 질문(기록 초기화)
      if (state.phase === 'splash') return { ...state, phase: 'intro' };
      if (state.phase === 'intro') {
        return { ...state, phase: 'question', history: [], pendingChoice: null };
      }
      return state;
    }

    case 'CHOOSE': {
      if (state.phase !== 'question') return state;
      const index = state.history.length;
      const question = QUESTIONS[index];
      if (!question) return state; // 모든 질문 소진 (방어)
      return {
        ...state,
        phase: 'reaction',
        pendingChoice: action.choiceKey,
        history: [...state.history, { questionId: question.id, choiceKey: action.choiceKey }],
      };
    }

    case 'NEXT': {
      if (state.phase !== 'reaction') return state;
      const done = state.history.length >= QUESTIONS.length;
      return { ...state, phase: done ? 'result' : 'question', pendingChoice: null };
    }

    case 'BACK': {
      // 질문 화면에서만 뒤로. history.pop() → 점수는 파생이라 자동 정정.
      if (state.phase !== 'question') return state;
      if (state.history.length === 0) return { ...state, phase: 'intro' };
      return { ...state, history: state.history.slice(0, -1) };
    }

    case 'RESTART': {
      return { phase: 'intro', history: [], pendingChoice: null, deepLinkCell: null };
    }

    default:
      return state;
  }
}
