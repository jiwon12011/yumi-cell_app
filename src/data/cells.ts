import type { CellId, Intensity, PoseIndex } from '../logic/types';

export interface Cell {
  id: CellId;
  name: string;
  color: string;
  /** 통계·빈 상태 등에서 쓰는 한 줄 성격 */
  keyword: string;
}

// 표시·집계 순서의 기준 (기획서 §2)
export const CELL_IDS: CellId[] = [
  'emotion',
  'reason',
  'love',
  'pride',
  'rest',
  'anxiety',
  'impulse',
];

export const CELLS: Cell[] = [
  { id: 'emotion', name: '감성세포', color: '#FF6B9D', keyword: '느낌이 먼저, 몽글몽글' },
  { id: 'reason', name: '이성세포', color: '#4C7DFF', keyword: '계산·분석·결론부터' },
  { id: 'love', name: '사랑세포', color: '#FF4D6D', keyword: '과몰입 로맨티스트' },
  { id: 'pride', name: '자존심세포', color: '#9B5DE5', keyword: '지기 싫음, 쿨한 척' },
  { id: 'rest', name: '휴식세포', color: '#2EC4B6', keyword: '나른·느긋, 눕는 게 최고' },
  { id: 'anxiety', name: '불안세포', color: '#B79CED', keyword: '걱정 많고 조심스러움' },
  { id: 'impulse', name: '충동세포', color: '#FF8A65', keyword: '일단 지르고 본다' },
];

export const CELL_BY_ID = Object.fromEntries(CELLS.map((c) => [c.id, c])) as Record<
  CellId,
  Cell
>;

// 강도 → 기본 포즈 (기획서 §7.3 공통 규칙, 포즈 스와치로 override 가능)
export const INTENSITY_POSE: Record<Intensity, PoseIndex> = { 1: 2, 2: 1, 3: 3 };

export const INTENSITY_LABEL: Record<Intensity, string> = {
  1: '살짝',
  2: '보통',
  3: '완전',
};

export const POSE_INDEXES: PoseIndex[] = [1, 2, 3, 4, 5];
