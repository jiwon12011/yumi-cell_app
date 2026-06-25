import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Bubble } from '../components/Bubble';
import { CellImage } from '../components/CellImage';
import { CELL_BY_ID } from '../data/cells';
import type { Choice } from '../data/types';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

interface Props {
  choice: Choice;
  isLast: boolean;
  onNext: () => void;
}

// 타임라인 (motion-engineer 확정): 발화자 seq마다
//  char 등장 = seq*STEP, bubble = seq*STEP + BUBBLE_OFFSET, bob = 등장 직후.
const STEP = 900;
const BUBBLE_OFFSET = 450;
const CHAR_DUR = 420;
const BUBBLE_DUR = 380;
const BOB_DUR = 850;
const DUST_DX = ['-14px', '0px', '14px'];

export function Reaction({ choice, isLast, onNext }: Props) {
  const speakers = choice.reactions;
  const n = speakers.length;
  const reduced = usePrefersReducedMotion();

  // 시퀀스 진행 상태. revealed/bubbles = "몇 번째까지 진행됐나".
  const [revealed, setRevealed] = useState(0);
  const [bubbles, setBubbles] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [bobIndex, setBobIndex] = useState(-1);
  const [finished, setFinished] = useState<Set<number>>(new Set()); // 등장 애니 끝난 발화자
  const [dustGone, setDustGone] = useState<Set<number>>(new Set());
  const [instant, setInstant] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  // 시퀀스 도중 탭 → 즉시 전체 표시(skip). reduced-motion도 같은 종착 상태.
  const skipToEnd = useCallback(() => {
    clearTimers();
    setInstant(true);
    setRevealed(n);
    setBubbles(n);
    setActiveIndex(n - 1);
    setBobIndex(-1);
    setDone(true);
  }, [n]);

  useEffect(() => {
    if (reduced) {
      setInstant(true);
      setRevealed(n);
      setBubbles(n);
      setActiveIndex(n - 1);
      setDone(true);
      return;
    }
    const at = (fn: () => void, t: number) => {
      timers.current.push(window.setTimeout(fn, t));
    };
    speakers.forEach((_, seq) => {
      // 1) 캐릭터 톡 등장 + 이전 발화자 inactive
      at(() => {
        setRevealed((c) => Math.max(c, seq + 1));
        setActiveIndex(seq);
      }, seq * STEP);
      // 2) 등장 직후 들썩임(bob)
      at(() => setBobIndex(seq), seq * STEP + CHAR_DUR);
      at(() => setBobIndex((b) => (b === seq ? -1 : b)), seq * STEP + CHAR_DUR + BOB_DUR);
      // 3) 말풍선 톡
      at(() => setBubbles((c) => Math.max(c, seq + 1)), seq * STEP + BUBBLE_OFFSET);
    });
    // 모든 발화 끝 → 탭 힌트
    at(() => setDone(true), (n - 1) * STEP + BUBBLE_OFFSET + BUBBLE_DUR + 60);

    return clearTimers;
    // speakers는 choice별 고정 — n/reduced 변화 시에만 재구동
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, n]);

  // 화면 탭: 진행 중이면 skip, 끝났으면 NEXT (게임풍 "탭하여 계속")
  const handleTap = () => (done ? onNext() : skipToEnd());

  function actorClass(i: number): string {
    if (instant) return `actor ${i === activeIndex ? 'is-active' : 'is-inactive'}`;
    if (i >= revealed) return 'actor is-pending';
    let cls = 'actor';
    if (!finished.has(i)) cls += ' is-entering';
    if (i === activeIndex) {
      cls += ' is-active';
      if (bobIndex === i) cls += ' is-bobbing';
    } else {
      cls += ' is-inactive';
    }
    return cls;
  }

  return (
    <section className={`screen meeting${instant ? ' is-instant' : ''}`} onClick={handleTap}>
      <span className="meeting__bokeh meeting__bokeh--a" aria-hidden="true" />
      <span className="meeting__bokeh meeting__bokeh--b" aria-hidden="true" />
      <span className="meeting__floor" aria-hidden="true" />

      {/* 무대: 발화자들이 차례로 등장 */}
      <div className="meeting__stage">
        {speakers.map((sp, i) => {
          const meta = CELL_BY_ID[sp.cell];
          return (
            <div
              key={`${sp.cell}-${i}`}
              className={actorClass(i)}
              style={{ '--cell-color': meta?.color } as CSSProperties}
              onAnimationEnd={(e) => {
                if (e.animationName === 'cell-enter') {
                  setFinished((prev) => new Set(prev).add(i));
                }
              }}
            >
              {!instant && i < revealed && !dustGone.has(i) && (
                <span
                  className="actor__dust"
                  aria-hidden="true"
                  onAnimationEnd={(e) => {
                    if (e.animationName === 'dust-poof') {
                      setDustGone((prev) => new Set(prev).add(i));
                    }
                  }}
                >
                  {DUST_DX.map((dx, d) => (
                    <span key={d} style={{ '--dx': dx } as CSSProperties} />
                  ))}
                </span>
              )}
              <CellImage cell={sp.cell} size={84} frame="hero" />
              <span className="actor__name">{meta?.name}</span>
            </div>
          );
        })}
      </div>

      {/* 말풍선이 화자 순서대로 톡톡 쌓임 */}
      <ul className="meeting__bubbles">
        {speakers.map((sp, i) => (
          <Bubble key={`${sp.cell}-${i}`} reaction={sp} shown={instant || i < bubbles} />
        ))}
      </ul>

      <div className="meeting__footer">
        {done ? (
          <>
            <p className="meeting__hint" aria-hidden="true">
              탭하여 계속 ▼
            </p>
            <button
              type="button"
              className="btn btn--primary meeting__next"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
            >
              {isLast ? '결과 보기' : '다음'}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="meeting__skip"
            onClick={(e) => {
              e.stopPropagation();
              skipToEnd();
            }}
          >
            바로 보기
          </button>
        )}
      </div>
    </section>
  );
}
