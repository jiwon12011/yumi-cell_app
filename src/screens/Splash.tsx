import { useEffect } from 'react';
import { CellImage } from '../components/CellImage';

interface Props {
  onDone: () => void;
}

// 유미(emotion 이미지)가 마스코트. 1.5초 후 자동 진행, 탭/키로 즉시 skip.
export function Splash({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <section
      className="screen screen--center screen--grad splash"
      role="button"
      tabIndex={0}
      aria-label="시작하기"
      onClick={onDone}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onDone();
        }
      }}
    >
      <CellImage cell="emotion" size={240} frame="hero" eager />
      <div>
        <h1 className="splash__title">오늘의 세포 회의</h1>
        <p className="splash__sub">세포들이 회의를 준비 중이야...</p>
      </div>
      <p className="splash__hint">화면을 탭하면 시작해요</p>
    </section>
  );
}
