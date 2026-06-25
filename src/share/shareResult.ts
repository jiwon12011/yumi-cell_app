import type { ResultType } from '../data/types';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/** 결과 카드 PNG를 File로 가져온다. 없거나 실패하면 null (→ 텍스트 공유로 폴백). */
async function fetchCardFile(cell: string): Promise<File | null> {
  try {
    const res = await fetch(`/cards/${cell}.png`);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null; // 404 HTML 등 방어
    return new File([blob], `oneul-cell-${cell}.png`, { type: blob.type });
  } catch {
    return null;
  }
}

/**
 * 공유 3단 폴백:
 *  ① 카드 PNG 파일 첨부 공유 (navigator.share({files})) — canShare로 지원 확인
 *  ② 텍스트 + URL 공유 (navigator.share)
 *  ③ 클립보드 복사
 * 카드 PNG가 아직 없으면 fetch가 null → 자동으로 ②/③로 내려간다(안전).
 */
export async function shareResult(result: ResultType): Promise<ShareOutcome> {
  const { origin, pathname } = window.location;
  const url = `${origin}${pathname}?r=${result.cell}`;
  const text = result.shareText;

  // ① 파일 첨부 공유
  const file = await fetchCardFile(result.cell);
  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text, url });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
      // 그 외엔 아래 텍스트 공유로 폴백
    }
  }

  // ② 텍스트 + URL 공유
  if (navigator.share) {
    try {
      await navigator.share({ title: '오늘의 세포 회의', text, url });
      return 'shared';
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    }
  }

  // ③ 클립보드 복사
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
