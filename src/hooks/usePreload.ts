import { useEffect } from 'react';

const warmed = new Set<string>();

/** 이미지 URL을 브라우저 캐시에 미리 올린다 (기획서 §10.3 예측 프리로드). */
export function warmImages(urls: string[]): void {
  for (const url of urls) {
    if (warmed.has(url)) continue;
    warmed.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}

/** urls가 바뀔 때마다 워밍. 렌더 차단 없음 — 완료 대기하지 않는다. */
export function usePreload(urls: string[]): void {
  useEffect(() => {
    warmImages(urls);
    // 문자열 배열 내용 기준으로 재실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urls.join('|')]);
}
