/** canvas → PNG 공유. Web Share(files) 미지원이면 다운로드 폴백 (기획서 §4.6) */
export async function shareOrDownload(canvas: HTMLCanvasElement, date: string): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('이미지 생성 실패');

  const filename = `세포일기-${date}.png`;
  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '세포 감정일기' });
      return;
    } catch (err) {
      // 사용자가 공유 시트를 닫은 경우는 정상 흐름
      if (err instanceof Error && err.name === 'AbortError') return;
      // 그 외 실패는 다운로드로 폴백
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
