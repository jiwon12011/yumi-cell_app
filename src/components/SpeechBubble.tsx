import type { ReactNode } from 'react';

/** CSS 말풍선 — PNG를 늘리면 깨지므로 코드로 그린다 (기획서 §8.4) */
export function SpeechBubble({ children, animate = false }: { children: ReactNode; animate?: boolean }) {
  return (
    <div className={`speech-bubble${animate ? ' anim-pop-in' : ''}`} role="status">
      {children}
    </div>
  );
}
