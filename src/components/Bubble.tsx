import type { CSSProperties } from 'react';
import { CELL_BY_ID } from '../data/cells';
import type { CellReaction } from '../data/types';
import { CellImage } from './CellImage';

interface Props {
  reaction: CellReaction;
  /** 시퀀스에서 이 말풍선이 등장할 차례가 됐는지 (false면 opacity 0 대기) */
  shown?: boolean;
}

// 누가 말하는지 보이게: 작은 아바타 + 이름 + 세포컬러 좌측 보더 + 꼬리. 본문은 본문색 고정.
export function Bubble({ reaction, shown = true }: Props) {
  const meta = CELL_BY_ID[reaction.cell];
  return (
    <li
      className={`bubble${shown ? ' is-shown' : ''}`}
      style={{ '--cell': meta?.color } as CSSProperties}
    >
      <CellImage cell={reaction.cell} size={40} frame="avatar" className="bubble__avatar" />
      <div className="bubble__body">
        <span className="bubble__name">{meta?.name}</span>
        <p className="bubble__text">{reaction.text}</p>
      </div>
    </li>
  );
}
