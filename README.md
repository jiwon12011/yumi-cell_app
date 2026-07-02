# 세포 감정일기

> 오늘의 나는 어떤 세포일까? — 유미의 세포들 무드의 하루 한 줄 감정일기 (모바일 웹, PWA)

매일 기분을 세포 캐릭터 7종(감성·이성·사랑·자존심·휴식·불안·충동) 중 하나 + 강도(살짝/보통/완전) + 한 줄 노트(80자)로 기록하면, 세포가 말풍선으로 리액션합니다. 달력·통계로 한 달의 감정 흐름을 보고, 1080×1080 공유 카드를 만들 수 있습니다.

상세 기획: [docs/기획서.md](docs/기획서.md)

## 실행

```bash
npm install
npm run dev        # 개발 서버
npm test           # 유닛 테스트 (Vitest)
npm run build      # 타입체크 + 프로덕션 빌드 (PWA 포함)
npm run preview    # 빌드 결과 로컬 확인
npm run optimize:images  # 원본 PNG → public/optimized WebP 재생성 (sharp)
```

## 구조

```
src/
  logic/        순수 함수 (날짜, 저장소, 통계, 멘트 선택) — 전부 유닛 테스트
  data/         세포 정의, 멘트 105줄, 이미지 경로 헬퍼(assets.ts 단일 지점)
  hooks/        useEntries(localStorage 영속), useView(탭+해시 딥링크), usePreload
  components/   Today / Reaction / Calendar / Stats / 시트·모달들
  share/        공유 카드 canvas 그리기 + Web Share/다운로드 폴백
scripts/optimize-images.mjs   이미지 파이프라인 (122장, 32.5MB → 1.1MB)
```

## 데이터

- localStorage 단일 키 `cell-mood-diary:v1` — 서버·로그인 없음
- 날짜 키는 로컬 타임존 기준 `YYYY-MM-DD` (`toISOString()` 금지)
- 딥링크: `#/d/2026-07-02`

## 메모

- 앱 코드는 `public/optimized/`(WebP)만 참조. 원본 PNG(`public/*-v2/`)는 소스 보관용.
- `public/cards-v2/mature-backgrounds/`는 톤앤매너 불일치로 **사용 금지** (기획서 §7.4).
- Jua 폰트는 기획서의 셀프호스팅 대신 Google Fonts CDN(한글 unicode-range 서브셋) 사용 — 초기 로드 예산상 유리, 오프라인은 시스템 폰트 폴백.
- 개선 아이디어: 원본 PNG를 `public/` 밖으로 옮기면 배포 산출물이 ~44MB 가벼워짐 (현재는 기획서대로 유지).
