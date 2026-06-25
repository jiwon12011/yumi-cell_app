import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** prefers-reduced-motion 존중. JS 타임라인을 즉시(0)로 단축할 때 쓴다. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
