import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ProgressBar } from '../components/ProgressBar';
import { CELL_BY_ID } from '../data/cells';
import type { ChoiceKey, Question as QuestionData } from '../data/types';
import { dominantCellOfQuestion } from './util';

interface Props {
  question: QuestionData;
  total: number;
  canGoBack: boolean;
  onChoose: (key: ChoiceKey) => void;
  onBack: () => void;
}

// A=핑크 / B=블루는 시각 구분용 색일 뿐, 세포 의미 아님.
const SCHEME: Record<ChoiceKey, string> = { A: 'pink', B: 'blue' };

// 질문이 바뀌면 App에서 key={question.id}로 리마운트 → 선택 상태 자동 초기화.
export function Question({ question, total, canGoBack, onChoose, onBack }: Props) {
  const [selected, setSelected] = useState<ChoiceKey | null>(null);
  const tint = CELL_BY_ID[dominantCellOfQuestion(question)]?.color;

  return (
    <section className="screen question" style={{ '--tint': tint } as CSSProperties}>
      <header className="question__head">
        {canGoBack && (
          <button type="button" className="question__back" onClick={onBack}>
            ← 이전
          </button>
        )}
        <span className="question__count">
          Q {question.index} / {total}
        </span>
        <ProgressBar value={question.index} max={total} />
      </header>

      <h2 className="question__situation">{question.situation}</h2>

      <div className="question__choices">
        {question.choices.map((choice) => (
          <button
            key={choice.key}
            type="button"
            className={`qcard qcard--${SCHEME[choice.key]}${selected === choice.key ? ' is-selected' : ''}`}
            aria-pressed={selected === choice.key}
            onClick={() => setSelected(choice.key)}
          >
            <span className="qcard__badge" aria-hidden="true">
              {choice.key}
            </span>
            <span className="qcard__label">{choice.label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary question__next"
        data-visible={selected ? 'true' : 'false'}
        disabled={!selected}
        onClick={() => selected && onChoose(selected)}
      >
        다음
      </button>
    </section>
  );
}
