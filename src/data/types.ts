// 도메인 타입 단일 출처. 기획서 §4 데이터 모델을 타입으로 못박는다.

/** 결과 집계에 들어가는 점수 세포 5종 */
export type ScoredCellId = 'emotion' | 'reason' | 'love' | 'pride' | 'rest';

/** 점수에 안 들어가고 Reaction 말풍선에만 등장하는 분위기 세포 2종 */
export type MoodCellId = 'anxiety' | 'impulse';

/** 말풍선에 등장 가능한 모든 세포 */
export type CellId = ScoredCellId | MoodCellId;

export type ChoiceKey = 'A' | 'B';

/** 한 선택이 올려주는 세포 점수 (점수 세포만, 0~N) */
export type ScoreMap = Partial<Record<ScoredCellId, number>>;

export interface Cell {
  id: CellId;
  /** 화면 표기명 (감성세포 등) */
  name: string;
  /** 테마/말풍선 컬러 */
  color: string;
  /** 카피 작성용 말투 가이드 (코드 로직엔 안 씀) */
  tone: string;
  /** true = 점수 집계 대상(5종), false = 분위기 세포(2종) */
  scored: boolean;
}

export interface CellReaction {
  /** 누가 말하는가 (분위기 세포 포함 가능) */
  cell: CellId;
  /** 말풍선 대사 (≤20자, 반말 구어) */
  text: string;
}

export interface Choice {
  key: ChoiceKey;
  /** 선택지 버튼 텍스트 */
  label: string;
  /** 선택 후 Reaction 화면 말풍선 2~3개 */
  reactions: CellReaction[];
  /** 이 선택이 올려주는 세포 점수 */
  scores: ScoreMap;
}

export interface Question {
  id: string;
  /** 1-based 순서 (진행도 표시용) */
  index: number;
  /** 상황 지문 */
  situation: string;
  /** 항상 A, B 정확히 2개 */
  choices: [Choice, Choice];
}

export interface ResultType {
  /** 대표 세포 id와 1:1 */
  id: ScoredCellId;
  cell: ScoredCellId;
  title: string;
  subtitle: string;
  description: string;
  /** 공유용 정적 카드 이미지 경로 */
  cardImage: string;
  shareText: string;
  /** 카드에 들어갈 대표 세포 대사 한 줄 */
  cellQuote: string;
}

/** 상태의 단일 진실: 사용자의 선택 기록. 점수·진행도·결과는 전부 여기서 파생. */
export interface HistoryEntry {
  questionId: string;
  choiceKey: ChoiceKey;
}
