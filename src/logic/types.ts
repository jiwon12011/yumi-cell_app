// 도메인 타입 — 기획서 §6.1
export type CellId =
  | 'emotion'
  | 'reason'
  | 'love'
  | 'pride'
  | 'rest'
  | 'anxiety'
  | 'impulse';

export type Intensity = 1 | 2 | 3;
export type PoseIndex = 1 | 2 | 3 | 4 | 5;

export interface DiaryEntry {
  /** 'YYYY-MM-DD' — 로컬 타임존 기준. entries 맵의 키와 동일 */
  date: string;
  cellId: CellId;
  poseIndex: PoseIndex;
  intensity: Intensity;
  /** trim 후 최대 80자 (서로게이트 안전 카운트) */
  note: string;
  createdAt: number;
  updatedAt: number;
}

export type EntriesMap = Record<string, DiaryEntry>;

export interface StoreV1 {
  version: 1;
  onboarded: boolean;
  /** 앱 주인 이름 — "○○의 세포들" 개인화. 빈 문자열이면 미설정 */
  userName: string;
  entries: EntriesMap;
}
