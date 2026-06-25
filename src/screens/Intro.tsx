import { CellImage } from '../components/CellImage';
import { CELL_BY_ID, SCORED_CELL_IDS } from '../data/cells';

interface Props {
  onStart: () => void;
}

export function Intro({ onStart }: Props) {
  return (
    <section className="screen screen--center screen--grad intro">
      <div>
        <h1 className="intro__title">오늘의 세포 회의</h1>
        <p className="intro__tagline">지금 내 머릿속 세포들이 회의 중이야.</p>
      </div>
      <p className="intro__desc">A를 고를까, B를 고를까 — 어차피 세포들이 정한다.</p>

      <ul className="intro__preview">
        {SCORED_CELL_IDS.map((id, i) => (
          <li key={id} className="intro__cell" style={{ animationDelay: `${i * 0.3}s` }}>
            <CellImage cell={id} size={72} frame="avatar" className="intro__cell-img" />
            <span className="intro__cell-name">{CELL_BY_ID[id]?.name}</span>
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn--primary intro__cta" onClick={onStart}>
        회의 참석하기
      </button>
    </section>
  );
}
