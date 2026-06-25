import { useReducer } from 'react';
import { QUESTIONS, QUESTION_BY_ID } from './data/questions';
import { RESULT_BY_CELL } from './data/results';
import { deriveResult } from './logic/deriveResult';
import { initState, quizReducer } from './state/quizReducer';
import { Splash } from './screens/Splash';
import { Intro } from './screens/Intro';
import { Question } from './screens/Question';
import { Reaction } from './screens/Reaction';
import { Result } from './screens/Result';
import { ShareCard, getCardCell } from './screens/ShareCard';

export function App() {
  const [state, dispatch] = useReducer(quizReducer, undefined, initState);
  const total = QUESTIONS.length;

  // 캡처 라우트: ?card=<cellId> 면 카드 1장만 풀화면 렌더 (본 플로우 영향 없음).
  const cardCell = getCardCell();
  if (cardCell) return <ShareCard cell={cardCell} />;

  return (
    <div className="app">
      {/* 배경 글로우 2장 (fixed, pointer-events 없음). drift는 reduced-motion에서 자동 정지. */}
      <div className="bg-glow bg-glow--a" aria-hidden="true" />
      <div className="bg-glow bg-glow--b" aria-hidden="true" />

      {state.phase === 'splash' && <Splash onDone={() => dispatch({ type: 'START' })} />}

      {state.phase === 'intro' && <Intro onStart={() => dispatch({ type: 'START' })} />}

      {state.phase === 'question' &&
        (() => {
          const question = QUESTIONS[state.history.length];
          if (!question) return null;
          return (
            <Question
              key={question.id}
              question={question}
              total={total}
              canGoBack={state.history.length > 0}
              onChoose={(choiceKey) => dispatch({ type: 'CHOOSE', choiceKey })}
              onBack={() => dispatch({ type: 'BACK' })}
            />
          );
        })()}

      {state.phase === 'reaction' &&
        (() => {
          const last = state.history[state.history.length - 1];
          const question = last ? QUESTION_BY_ID.get(last.questionId) : undefined;
          const choice = question?.choices.find(
            (c) => c.key === (state.pendingChoice ?? last?.choiceKey),
          );
          if (!choice) return null;
          return (
            <Reaction
              choice={choice}
              isLast={state.history.length >= total}
              onNext={() => dispatch({ type: 'NEXT' })}
            />
          );
        })()}

      {state.phase === 'result' &&
        (() => {
          // 딥링크(?r=)면 그 세포, 아니면 history에서 파생.
          const result = state.deepLinkCell
            ? RESULT_BY_CELL.get(state.deepLinkCell)
            : deriveResult(state.history);
          if (!result) return null;
          return <Result result={result} onRestart={() => dispatch({ type: 'RESTART' })} />;
        })()}
    </div>
  );
}
