import type { ResultType } from '../data/types';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/**
 * 이번 단계는 최소 공유: Web Share(text+url) → 없으면 클립보드 복사.
 * 결과 카드 이미지 첨부 공유는 다음 단계(에셋 + 3단 폴백).
 */
export async function shareResult(result: ResultType): Promise<ShareOutcome> {
  const { origin, pathname } = window.location;
  const url = `${origin}${pathname}?r=${result.cell}`;
  const text = result.shareText;

  if (navigator.share) {
    try {
      await navigator.share({ title: '오늘의 세포 회의', text, url });
      return 'shared';
    } catch (err) {
      // 사용자가 공유 시트를 닫은 경우는 실패가 아님
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // 그 외엔 복사로 폴백
    }
  }

  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
