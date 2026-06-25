import type { Cell, ScoredCellId } from './types';

// 점수 집계에 쓰는 5종은 이 순서로 고정. tally 초기화·우선순위 계산의 기준.
export const SCORED_CELL_IDS: ScoredCellId[] = [
  'emotion',
  'reason',
  'love',
  'pride',
  'rest',
];

// 세포 7종 (점수 5 + 분위기 2). 기획서 §2.
export const CELLS: Cell[] = [
  {
    id: 'emotion',
    name: '감성세포',
    color: '#FF6B9D',
    tone: '느낌 먼저. "왜인지 몰라도~", "그냥 좋잖아"',
    scored: true,
  },
  {
    id: 'reason',
    name: '이성세포',
    color: '#4C7DFF',
    tone: '계산·분석. "잠깐, 계산해보면", "그러니까 결론은"',
    scored: true,
  },
  {
    id: 'love',
    name: '사랑세포',
    color: '#FF4D6D',
    tone: '상대 먼저, 과몰입. "걔는 지금 어떨까", "보고싶다"',
    scored: true,
  },
  {
    id: 'pride',
    name: '자존심세포',
    color: '#9B5DE5',
    tone: '지기 싫음, 쿨한 척. "내가 먼저? 그건 좀", "아무렇지 않아(거짓말)"',
    scored: true,
  },
  {
    id: 'rest',
    name: '휴식세포',
    color: '#2EC4B6',
    tone: '나른·느긋. "이따 하면 되잖아", "누워있고 싶다"',
    scored: true,
  },
  {
    id: 'anxiety',
    name: '불안세포',
    color: '#B79CED', // 라일락
    tone: '끼어들어 걱정. "혹시 잘못 고른 거 아냐?"',
    scored: false,
  },
  {
    id: 'impulse',
    name: '충동세포',
    color: '#FF8A65', // 코랄
    tone: '질러버리기. "그냥 해버려!"',
    scored: false,
  },
];

export const CELL_BY_ID: Record<string, Cell> = Object.fromEntries(
  CELLS.map((c) => [c.id, c]),
);
