import { QUESTIONS } from './data/questions';
import { RESULTS } from './data/results';

// 2단계는 데이터·로직·테스트 척추까지만. 화면 UI는 다음 단계(로드맵 4)에서 구현.
// 여기서는 데이터가 정상 import 되는지 확인하는 최소 플레이스홀더만 둔다.
export function App() {
  return (
    <main>
      오늘의 세포 회의 — 질문 {QUESTIONS.length}개 / 결과 {RESULTS.length}유형 로드됨.
      화면은 다음 단계에서 구현합니다.
    </main>
  );
}
