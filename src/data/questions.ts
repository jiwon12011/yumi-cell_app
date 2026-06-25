import type { Question } from './types';

// 기획서 §3-2 질문 7개. 점수 코드 매핑: E=emotion R=reason L=love P=pride H=rest,
// 분위기 불안=anxiety 충동=impulse.
export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    index: 1,
    situation: '주말 아침. 알람 없이 눈이 떠졌다. 오늘 아무 계획 없음.',
    choices: [
      {
        key: 'A',
        label: '이불 속에서 좀 더 뒹굴기',
        scores: { rest: 2, emotion: 1 },
        reactions: [
          { cell: 'rest', text: '이게 맞지. 역시 나야.' },
          { cell: 'emotion', text: '오늘 이 기분 너무 좋아' },
          { cell: 'impulse', text: '일단 유튜브만 켜봐' },
        ],
      },
      {
        key: 'B',
        label: '오래 못 본 친구한테 연락하기',
        scores: { love: 2, emotion: 1 },
        reactions: [
          { cell: 'love', text: '맞아 보고싶다 진짜로' },
          { cell: 'emotion', text: '왜 갑자기 설레지?' },
          { cell: 'anxiety', text: '갑자기 연락하면 이상한가' },
        ],
      },
    ],
  },
  {
    id: 'q2',
    index: 2,
    situation: '점심 메뉴를 골라야 한다. 혼자 먹을 거라 내 맘대로 가능.',
    choices: [
      {
        key: 'A',
        label: '어제부터 먹고 싶었던 거 그냥 먹는다',
        scores: { emotion: 2 },
        reactions: [
          { cell: 'emotion', text: '이게 내 오늘이야' },
          { cell: 'love', text: '맞아 이거 나도 좋아해' },
          { cell: 'impulse', text: '대자로 시켜 후회 없이' },
        ],
      },
      {
        key: 'B',
        label: '영양소랑 칼로리 따져서 결정한다',
        scores: { reason: 2 },
        reactions: [
          { cell: 'reason', text: '그러니까 이쪽이 맞잖아' },
          { cell: 'pride', text: '이 정도는 챙겨야지' },
          { cell: 'anxiety', text: '근데 맛있긴 한 건가?' },
        ],
      },
    ],
  },
  {
    id: 'q3',
    index: 3,
    situation: '카톡 보냈는데 읽음 표시 뜨고 답장이 없다.',
    choices: [
      {
        key: 'A',
        label: '내가 뭔가 잘못했나... 계속 생각한다',
        scores: { emotion: 2 },
        reactions: [
          { cell: 'emotion', text: '내가 뭘 잘못한 걸까...' },
          { cell: 'love', text: '걔 요즘 무슨 일 있나' },
          { cell: 'anxiety', text: '설마 나 싫어진 거 아니지?' },
        ],
      },
      {
        key: 'B',
        label: '나도 바빠서 그럴 때 있지, 넘긴다',
        scores: { rest: 2, reason: 1 },
        reactions: [
          { cell: 'rest', text: '어 나도 그럴 때 있어' },
          { cell: 'reason', text: '모르면 그냥 기다려' },
          { cell: 'impulse', text: '한 번 더 보내볼까?' },
        ],
      },
    ],
  },
  {
    id: 'q4',
    index: 4,
    situation: '길 가다가 전 연인이랑 딱 마주쳤다.',
    choices: [
      {
        key: 'A',
        label: '못 본 척하고 지나간다',
        scores: { pride: 2 },
        reactions: [
          { cell: 'pride', text: '이게 맞아. 내가 먼저?' },
          { cell: 'reason', text: '어색한 것보다 낫잖아' },
          { cell: 'impulse', text: '아 한 번 말 걸어볼까?' },
        ],
      },
      {
        key: 'B',
        label: '"어! 안녕, 잘 지냈어?" 먼저 인사한다',
        scores: { love: 2, emotion: 1 },
        reactions: [
          { cell: 'love', text: '잘 지냈길 바랐어 진짜' },
          { cell: 'emotion', text: '왜 이렇게 두근거리지' },
          { cell: 'pride', text: '...쿨하게 잘했어 그래도' },
        ],
      },
    ],
  },
  {
    id: 'q5',
    index: 5,
    situation: '인스타에 사진 올리려는데.',
    choices: [
      {
        key: 'A',
        label: '각도, 밝기, 필터 다 맞추고 올린다',
        scores: { pride: 2 },
        reactions: [
          { cell: 'pride', text: '이 정도는 해야지 당연' },
          { cell: 'emotion', text: '이게 지금 내 느낌이야' },
          { cell: 'anxiety', text: '뭔가 좀 이상하지 않아?' },
        ],
      },
      {
        key: 'B',
        label: '기억용 사진이라 그냥 바로 올린다',
        scores: { rest: 2, reason: 1 },
        reactions: [
          { cell: 'rest', text: '기억이면 충분해 그냥' },
          { cell: 'reason', text: '과정 생략하면 효율이야' },
          { cell: 'impulse', text: '그냥 올려버려 빠르게' },
        ],
      },
    ],
  },
  {
    id: 'q6',
    index: 6,
    situation: '내가 한 말에 친구가 반박해왔다. "그건 좀 아닌 것 같은데."',
    choices: [
      {
        key: 'A',
        label: '"그럴 수도 있겠다, 생각해볼게"',
        scores: { reason: 2, love: 1 },
        reactions: [
          { cell: 'reason', text: '그러니까 한번 생각해봐' },
          { cell: 'love', text: '관계가 더 중요하잖아' },
          { cell: 'pride', text: '...억울하긴 한데' },
        ],
      },
      {
        key: 'B',
        label: '"아니 근데 내 말이 맞는데?"',
        scores: { pride: 2 },
        reactions: [
          { cell: 'pride', text: '아니 내가 맞잖아 진짜' },
          { cell: 'emotion', text: '억울해 진짜로' },
          { cell: 'anxiety', text: '근데 내가 틀렸으면 어떡해' },
        ],
      },
    ],
  },
  {
    id: 'q7',
    index: 7,
    situation: '갑자기 마음에 드는 사람이 생겼다.',
    choices: [
      {
        key: 'A',
        label: '설레는 감정 그냥 느끼면서 기다려본다',
        scores: { love: 2, emotion: 1 },
        reactions: [
          { cell: 'love', text: '이 감정 더 느껴봐' },
          { cell: 'emotion', text: '설레는 게 좋잖아 원래' },
          { cell: 'anxiety', text: '근데 상대방은 어떨까?' },
        ],
      },
      {
        key: 'B',
        label: '일단 그 사람 SNS 정독·분석 시작',
        scores: { reason: 2 },
        reactions: [
          { cell: 'reason', text: '알고 나서 결정해야지' },
          { cell: 'pride', text: '내가 불리한 건 싫어' },
          { cell: 'anxiety', text: '근데 이거 티 나면 어떡해' },
        ],
      },
    ],
  },
];

export const QUESTION_BY_ID: Map<string, Question> = new Map(
  QUESTIONS.map((q) => [q.id, q]),
);
