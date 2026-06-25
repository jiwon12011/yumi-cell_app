import type { CSSProperties } from 'react';
import { CELL_BY_ID } from '../data/cells';
import type { CellId } from '../data/types';

// 이미지 자산이 있는 세포(점수 5종). 분위기 세포(불안/충동)는 컬러 원 폴백.
const CELLS_WITH_IMAGE = new Set<CellId>(['emotion', 'reason', 'love', 'pride', 'rest']);

/**
 * 제공 PNG가 누끼가 아니라 흰 배경이라 흰 사각형이 그대로 노출되는 문제가 있다.
 * 프레임으로 감싸 흰배경을 "의도된 둥근 배지" 디자인으로 흡수한다.
 *  - avatar: 원형 + 세포컬러 링/틴트 (말풍선/프리뷰)
 *  - hero:   원형 + radial 글로우 + drop-shadow (Splash/Reaction/Result 대표세포)
 *  - plain:  프레임 없음
 */
type Frame = 'avatar' | 'hero' | 'plain';

interface Props {
  cell: CellId;
  /** px (width=height, CLS 방지를 위해 항상 지정) */
  size: number;
  frame?: Frame;
  className?: string;
  /** LCP 후보(스플래시/결과 히어로)는 eager, 나머지는 lazy */
  eager?: boolean;
}

export function CellImage({ cell, size, frame = 'plain', className, eager = false }: Props) {
  const meta = CELL_BY_ID[cell];
  const name = meta?.name ?? cell;
  const style = { width: size, height: size, '--cell': meta?.color } as CSSProperties;

  // 분위기 세포: 이미지 없음 → 컬러 원 + 이니셜 (흰배경 문제 자체가 없음)
  if (!CELLS_WITH_IMAGE.has(cell)) {
    return (
      <span
        className={`cell-avatar-fallback ${className ?? ''}`}
        role="img"
        aria-label={name}
        style={{ ...style, background: meta?.color, fontSize: size * 0.5 }}
      >
        {name.charAt(0)}
      </span>
    );
  }

  const img = (
    <picture>
      <source srcSet={`/cells/${cell}.webp`} type="image/webp" />
      <img
        src={`/cells/${cell}.png`}
        alt={name}
        width={size}
        height={size}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
      />
    </picture>
  );

  if (frame === 'plain') {
    return (
      <span className={`cell-plain ${className ?? ''}`} style={style}>
        {img}
      </span>
    );
  }

  return (
    <span className={`cell-frame cell-frame--${frame} ${className ?? ''}`} style={style}>
      {img}
    </span>
  );
}
