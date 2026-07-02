import { CELL_BY_ID } from '../data/cells';
import { poseThumbPath } from '../data/assets';
import type { CellId, PoseIndex } from '../logic/types';

interface Props {
  cellId: CellId;
  pose: PoseIndex;
  size: number;
  className?: string;
  lazy?: boolean;
}

/** 포즈 썸네일 <img> 래퍼 — 크기 고정(CLS 방지), lazy/async 기본 (기획서 §10.3) */
export function CellFace({ cellId, pose, size, className, lazy = true }: Props) {
  return (
    <img
      src={poseThumbPath(cellId, pose)}
      alt={CELL_BY_ID[cellId].name}
      width={size}
      height={size}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      className={className}
    />
  );
}
