import { CELL_BY_ID, CELL_IDS } from './cells';
import { hashString } from '../logic/pickComment';
import type { CellId } from '../logic/types';

/**
 * 세포 회의 발언 풀 — 원작의 "세포들이 회의에서 티격태격"을 재현.
 * 각 세포(발언자)가 오늘의 의장(선택된 세포)에게 던지는 한마디. {name} = 의장 이름(세포 뗀 형태).
 * pickComment와 마찬가지로 순서 변경 금지 (date-hash 결정성).
 */
export const MEETING_LINES: Record<CellId, string[]> = {
  emotion: [
    '오늘 의장이 {name}이라니, 왠지 뭉클해…',
    '{name} 얘기 듣는데 눈물 날 뻔했어',
    '느낌으로 알았어. 오늘은 {name}의 날이야',
    '마음이 자꾸 {name} 쪽으로 기울더라',
    '{name}아, 오늘 고생했어. 안아줄게',
  ],
  reason: [
    '기록 분석 결과, 의장은 {name}이 맞아',
    '{name} 당선. 데이터에 이견 없음',
    '오늘 지분율 1위는 {name}. 결론 끝',
    '합리적 선택이야. {name}으로 승인',
    '{name}? 예측 범위 안이야. 통과',
  ],
  love: [
    '{name}아 오늘 너무 멋있었어! 심쿵!',
    '의장석의 {name}… 좀 설렌다?',
    '{name} 최고! 오늘의 주인공!',
    '박수! {name}에게 하트 보낼게',
    '{name} 뽑힐 줄 알았어. 내 촉은 사랑이니까',
  ],
  pride: [
    '뭐, {name} 정도면 인정해줄게',
    '내가 아니라고? …{name}이니까 봐준다',
    '흥, 오늘만 {name}에게 양보하는 거야',
    '{name} 나쁘지 않네. 나 다음으로',
    '의장석 관리 잘해, {name}. 지켜본다',
  ],
  rest: [
    '{name}이 의장이면 난 좀 쉬어도 되지?',
    '축하해 {name}~ 나는 눕는다',
    '{name}아 회의 짧게 하자… 졸려',
    '오늘은 {name}에게 맡기고 낮잠각',
    '{name} 축하해. 회식은 이불 속에서',
  ],
  anxiety: [
    '{name}이라니… 정말 괜찮은 거지?',
    '혹시 {name} 말고 다른 선택이 나았을까…',
    '{name}아, 내일 일정도 확인했어…?',
    '축하해 {name}. 근데 왠지 조마조마해',
    '{name} 믿을게. 믿어도 되지? 그렇지?',
  ],
  impulse: [
    '{name}!! 가는 거야!! 오늘 끝까지!!',
    '의장 {name} 당선 기념, 지르러 가자!',
    '좋아 {name}, 브레이크는 내가 버릴게',
    '{name} 최고!! 일단 박수부터 쳤어',
    '{name}과 함께라면 사고쳐도 재밌겠다',
  ],
};

/**
 * 정권 교체 발언 — 어제 의장이 오늘 의장에게 자리를 넘기며 하는 한마디 (세포별 말투).
 * 어제 기록이 있고 의장이 바뀐 날, 첫 번째 발언자가 어제 의장으로 고정된다.
 */
export const HANDOVER_LINES: Record<CellId, string> = {
  emotion: '어제 의장석, 내 자리였는데… {name}아 잘 부탁해',
  reason: '어제 의장으로서 인수인계 완료. {name}, 승인',
  love: '어제는 나였지! 오늘의 {name}도 응원해, 하트!',
  pride: '어제 의장은 나였는데… {name}, 오늘만 봐준다',
  rest: '어제 내가 의장이었나…? 아무튼 {name} 축하~',
  anxiety: '어제의 내가 뭘 놓쳤나… {name}아, 잘해줘…',
  impulse: '어제는 나! 오늘은 {name}! 내일은 또 나?!',
};

export interface MeetingRemark {
  speaker: CellId;
  line: string;
}

/**
 * 오늘의 회의 발언 2건 — date-hash 결정적. 같은 (날짜, 의장, 어제 의장)이면 항상 같은 장면.
 * 어제 의장이 있고 오늘과 다르면 첫 발언은 어제 의장의 인수인계 멘트가 된다 (기록이 이어지는 감각).
 */
export function pickMeetingRemarks(
  chair: CellId,
  dateISO: string,
  prevChair: CellId | null = null,
): [MeetingRemark, MeetingRemark] {
  const chairName = CELL_BY_ID[chair].name.replace('세포', '');
  const fill = (template: string) => template.replaceAll('{name}', chairName);
  const lineOf = (speaker: CellId, salt: string) => {
    const pool = MEETING_LINES[speaker];
    return fill(pool[hashString(`${dateISO}|${speaker}|${salt}`) % pool.length]);
  };

  const candidates = CELL_IDS.filter((id) => id !== chair);
  if (prevChair && prevChair !== chair) {
    const rest = candidates.filter((id) => id !== prevChair);
    const second = rest[hashString(`${dateISO}|${chair}|m2`) % rest.length];
    return [
      { speaker: prevChair, line: fill(HANDOVER_LINES[prevChair]) },
      { speaker: second, line: lineOf(second, 'l2') },
    ];
  }

  const first = candidates[hashString(`${dateISO}|${chair}|m1`) % candidates.length];
  const rest = candidates.filter((id) => id !== first);
  const second = rest[hashString(`${dateISO}|${chair}|m2`) % rest.length];
  return [
    { speaker: first, line: lineOf(first, 'l1') },
    { speaker: second, line: lineOf(second, 'l2') },
  ];
}
