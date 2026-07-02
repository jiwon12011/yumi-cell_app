import type { CellId, PoseIndex } from '../logic/types';

/**
 * 모든 이미지 경로의 단일 지점 (기획서 §7.1, §10.2).
 * 실제 파일은 scripts/optimize-images.mjs가 public/optimized/에 생성한 WebP.
 * 원본 PNG는 public/에 남아있지만 앱 코드는 여기 경로만 사용한다.
 * (cards-v2/mature-backgrounds는 사용 금지 — §7.4. 여기서도 노출하지 않는다.)
 */

export type BgName =
  | 'splash-room'
  | 'question-room'
  | 'reaction-stage'
  | 'result-celebration'
  | 'share-card-bg';

export type CardBgName =
  | 'cozy-desk'
  | 'lavender-panel'
  | 'meeting-board'
  | 'night-dream'
  | 'pink-blue-cloud'
  | 'sky-cloud';

export type IconName =
  | 'back'
  | 'close'
  | 'download'
  | 'home'
  | 'magic'
  | 'next'
  | 'play'
  | 'restart'
  | 'share'
  | 'sound';

export type DecorName =
  | 'bubble'
  | 'cloud-puff'
  | 'confetti-dots'
  | 'heart-cluster'
  | 'lavender-heart'
  | 'moon-bubble'
  | 'pink-ribbon'
  | 'plus-sparkle'
  | 'sparkle-cross'
  | 'speech-bubble'
  | 'star-bead'
  | 'sweat-drop';

export type PropName =
  | 'book'
  | 'checklist'
  | 'crown'
  | 'donut-cushion'
  | 'dumbbell'
  | 'heart-balloon'
  | 'iced-drink'
  | 'megaphone'
  | 'pencil'
  | 'pillow'
  | 'red-button'
  | 'tablet-chart';

const ROOT = '/optimized';

export const bgPath = (name: BgName) => `${ROOT}/backgrounds/${name}.webp`;

export const heroPath = (id: CellId) => `${ROOT}/cells/${id}.webp`;

/** 달력·선택 그리드용 소형 (128w) */
export const poseThumbPath = (id: CellId, pose: PoseIndex) =>
  `${ROOT}/cells/thumb/${id}-0${pose}.webp`;

/** 미리보기·공유카드용 중형 (512w) */
export const poseMidPath = (id: CellId, pose: PoseIndex) =>
  `${ROOT}/cells/mid/${id}-0${pose}.webp`;

export const cardBgPath = (name: CardBgName) => `${ROOT}/cards/${name}.webp`;

export const iconPath = (name: IconName) => `${ROOT}/icons/${name}.webp`;

export const decorPath = (name: DecorName) => `${ROOT}/decor/${name}.webp`;

export const propPath = (name: PropName) => `${ROOT}/props/${name}.webp`;

/** 세포 → 공유 카드 기본 프레임 (기획서 §4.6) */
export const DEFAULT_CARD_BG: Record<CellId, CardBgName> = {
  emotion: 'pink-blue-cloud',
  reason: 'sky-cloud',
  love: 'cozy-desk',
  pride: 'meeting-board',
  rest: 'night-dream',
  anxiety: 'lavender-panel',
  impulse: 'meeting-board',
};

export const CARD_BG_NAMES: CardBgName[] = [
  'cozy-desk',
  'lavender-panel',
  'meeting-board',
  'night-dream',
  'pink-blue-cloud',
  'sky-cloud',
];
