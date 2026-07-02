import { useState } from 'react';
import { bgPath, heroPath, propPath } from '../data/assets';
import { CELLS } from '../data/cells';
import { NAME_MAX } from '../logic/entriesStore';
import { CellFace } from './CellFace';

/** 첫 실행 온보딩 3장 + 이름 입력 (기획서 §4.1, 세포 회의 개편) */
export function Onboarding({ onDone }: { onDone: (name: string) => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const next = () => (step < 2 ? setStep(step + 1) : onDone(name));

  return (
    <div className="onboarding">
      <div className="onboarding-inner">
        {step === 0 && (
          <img src={bgPath('splash-room')} alt="" className="screen-bg" decoding="async" />
        )}
        <div className="onboarding-slide anim-fade-slide" key={step}>
          {step === 0 && (
            <>
              <img src={heroPath('emotion')} alt="감성세포" className="onb-hero" />
              <h1 className="title-lg">오늘의 나는 어떤 세포일까?</h1>
              <p className="text-caption">하루 30초, 세포로 남기는 감정일기</p>
            </>
          )}
          {step === 1 && (
            <>
              <div className="cell-grid" style={{ maxWidth: 320 }}>
                {CELLS.map((c) => (
                  <div key={c.id} className="cell-option" aria-hidden="true">
                    <CellFace cellId={c.id} pose={1} size={64} lazy={false} />
                    <span className="cell-name">{c.name.replace('세포', '')}</span>
                  </div>
                ))}
              </div>
              <h1 className="title-lg">매일 기분을 세포 하나로 기록해요</h1>
              <p className="text-caption">강도를 고르고, 한 줄만 남기면 끝</p>
            </>
          )}
          {step === 2 && (
            <>
              <img src={propPath('crown')} alt="" className="onb-hero" style={{ height: 140 }} />
              <h1 className="title-lg">당신의 세포들이 회의를 준비 중이에요</h1>
              <p className="text-caption">
                이름을 알려주면 “○○의 세포들”이 돼요 · 한 달 뒤엔 프라임 세포도 정해져요
              </p>
              <div className="note-field" style={{ width: '100%', maxWidth: 260 }}>
                <label className="sr-only" htmlFor="onb-name">
                  이름
                </label>
                <input
                  id="onb-name"
                  value={name}
                  maxLength={NAME_MAX * 2}
                  placeholder="이름 또는 별명 (선택)"
                  style={{ textAlign: 'center' }}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        <div className="onboarding-actions">
          <div className="onboarding-dots" aria-label={`3장 중 ${step + 1}장`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={i === step ? 'active' : ''} />
            ))}
          </div>
          <button className="btn btn--primary" onClick={next}>
            {step < 2 ? '다음' : '시작하기'}
          </button>
          {step < 2 && (
            <button className="skip-btn" onClick={() => onDone('')}>
              건너뛰기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
