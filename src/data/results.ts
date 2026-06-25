import type { ResultType } from './types';

// 기획서 §3-3 결과 5종. 점수 세포와 1:1. 카드 이미지는 /public/cards/{id}.png (다음 단계 에셋).
export const RESULTS: ResultType[] = [
  {
    id: 'emotion',
    cell: 'emotion',
    title: '감성세포형',
    subtitle: '느낌이 먼저야. 이유는 나중에.',
    description:
      "오늘 세포 회의에서 제일 목소리 높인 건 감성세포였어. 논리보다 분위기, 분석보다 직감으로 결정하는 스타일. '왜?'에 답이 없어도 그냥 맞는 느낌이면 그게 정답이라고 생각해.",
    cardImage: '/cards/emotion.png',
    shareText: '느낌이 맞으면 그게 답 — 오늘의 세포 회의',
    cellQuote: '왜인지 몰라도 그냥 이거야',
  },
  {
    id: 'reason',
    cell: 'reason',
    title: '이성세포형',
    subtitle: '계산이 먼저야. 감정은 그다음.',
    description:
      '오늘 회의에서 주도권을 잡은 건 이성세포였어. 선택 앞에서 조건을 따지고, 효율을 재고, 결론부터 뽑아내는 스타일. 감정이 없는 게 아니야 — 감정도 분석 대상이 될 뿐이지.',
    cardImage: '/cards/reason.png',
    shareText: '계산 끝났어. 정답은 이쪽 — 오늘의 세포 회의',
    cellQuote: '그러니까 결론만 말할게',
  },
  {
    id: 'love',
    cell: 'love',
    title: '사랑세포형',
    subtitle: '상대방 생각이 항상 먼저야.',
    description:
      '오늘 세포들 중 가장 바빴던 건 사랑세포야. 어떤 선택 앞에서도 다른 사람의 표정이 먼저 떠오르는 타입. 조금 과몰입해도 그게 단점인지 모르고 사는 편이야.',
    cardImage: '/cards/love.png',
    shareText: '걔는 지금 어떻게 지낼까 — 오늘의 세포 회의',
    cellQuote: '보고싶다 한 번만 더',
  },
  {
    id: 'pride',
    cell: 'pride',
    title: '자존심세포형',
    subtitle: '지는 건 옵션에 없어.',
    description:
      "오늘 회의에서 절대 안 물러선 건 자존심세포였어. 겉으론 쿨한 척해도 속으론 '내가 맞잖아'를 수십 번 되뇌는 스타일. 자존심 때문에 손해 보는 걸 알면서도 바꿀 생각은 없어.",
    cardImage: '/cards/pride.png',
    shareText: '아무렇지 않아(거짓말임) — 오늘의 세포 회의',
    cellQuote: '내가 먼저 연락은 좀',
  },
  {
    id: 'rest',
    cell: 'rest',
    title: '휴식세포형',
    subtitle: '쉬는 게 답일 때가 있어.',
    description:
      '오늘 세포 회의에서 가장 현명한 결론을 낸 건 휴식세포였어. 쉬어가는 선택을 자주 골랐다는 건, 지금 몸이 보내는 신호를 잘 읽고 있다는 거야. 게으른 게 아니야 — 충전 중인 거야.',
    cardImage: '/cards/rest.png',
    shareText: '충전 중이야, 방해하지 마 — 오늘의 세포 회의',
    cellQuote: '오늘 이거 하나만 하고',
  },
];

export const RESULT_BY_CELL: Map<ResultType['cell'], ResultType> = new Map(
  RESULTS.map((r) => [r.cell, r]),
);
