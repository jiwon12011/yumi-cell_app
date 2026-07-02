import { bgPath, decorPath, heroPath, iconPath, propPath } from '../data/assets';
import { CELL_BY_ID } from '../data/cells';
import { pickMeetingRemarks } from '../data/meeting';
import { formatKorean } from '../logic/dateUtils';
import { pickComment } from '../logic/pickComment';
import type { CellId, DiaryEntry } from '../logic/types';
import { CellFace } from './CellFace';
import { SpeechBubble } from './SpeechBubble';

interface Props {
  entry: DiaryEntry;
  userName: string;
  /** 이번 달 프라임 세포 (최다 기록) */
  primeCell: CellId | null;
  /** 어제의 의장 세포 — 있고 오늘과 다르면 인수인계 발언 연출 */
  prevChair: CellId | null;
  /** 같은 세포 연속 의장 일수 (오늘 포함) */
  chairDays: number;
  onEdit: () => void;
  onShare: () => void;
  onHome: () => void;
}

/**
 * 오늘의 세포 회의 (기획 개편) — 기록하면 세포들이 회의를 연다:
 * 다른 세포 2명이 먼저 의장(선택 세포)에 대해 한마디씩 던지고,
 * 의장이 왕관을 쓰고 중앙 단상에 등장해 오늘의 대사를 말한다.
 */
export function ReactionScreen({
  entry,
  userName,
  primeCell,
  prevChair,
  chairDays,
  onEdit,
  onShare,
  onHome,
}: Props) {
  const chair = CELL_BY_ID[entry.cellId];
  const comment = pickComment(entry.cellId, entry.intensity, entry.date);
  const remarks = pickMeetingRemarks(entry.cellId, entry.date, prevChair);

  return (
    <div className="screen">
      <img
        src={bgPath('reaction-stage')}
        alt=""
        className="screen-bg"
        fetchPriority="high"
        decoding="async"
      />
      {entry.intensity === 3 && (
        <>
          <img
            src={decorPath('confetti-dots')}
            alt=""
            className="float-decor anim-float"
            style={{ top: '10%', left: '8%', width: 72 }}
          />
          <img
            src={decorPath('plus-sparkle')}
            alt=""
            className="float-decor anim-float"
            style={{ top: '14%', right: '10%', width: 48, animationDelay: '1.2s' }}
          />
        </>
      )}
      <div className="screen-content reaction-stage">
        <p className="meeting-title anim-fade-slide">
          {userName ? `${userName}의 세포들` : '나의 세포들'} — 오늘의 회의
        </p>

        <div className="meeting-remarks">
          {remarks.map((r, i) => (
            <div
              key={r.speaker}
              className={`meeting-remark${i === 1 ? ' right' : ''} anim-pop-in`}
              style={{ animationDelay: `${300 + i * 700}ms` }}
            >
              <div className="meeting-speaker">
                <CellFace cellId={r.speaker} pose={1} size={52} lazy={false} />
                <span style={{ color: CELL_BY_ID[r.speaker].color }}>
                  {CELL_BY_ID[r.speaker].name.replace('세포', '')}
                </span>
              </div>
              <div
                className={`speech-bubble speech-bubble--chat${i === 1 ? ' from-right' : ''}`}
                style={{ borderColor: `${CELL_BY_ID[r.speaker].color}55` }}
              >
                {r.line}
              </div>
            </div>
          ))}
        </div>

        <div className="chair-area anim-pop-in" style={{ animationDelay: '1700ms' }}>
          <SpeechBubble>{comment}</SpeechBubble>
        </div>
        <div className="chair-hero anim-bounce-in" style={{ animationDelay: '1500ms' }}>
          <img src={propPath('crown')} alt="" className="chair-crown" decoding="async" />
          <img
            src={heroPath(entry.cellId)}
            alt={chair.name}
            className="reaction-hero"
            decoding="async"
          />
        </div>

        <div className="panel panel--soft reaction-note anim-fade-slide" style={{ animationDelay: '2100ms' }}>
          <p className="text-caption">{formatKorean(entry.date)}</p>
          <p className="title-md" style={{ color: chair.color }}>
            오늘의 의장: {chair.name}
            {chairDays >= 2 ? ` — ${chairDays}일 연속!` : ''}
          </p>
          {entry.note && <p style={{ margin: '4px 0 0' }}>“{entry.note}”</p>}
          {primeCell && (
            <p className="text-caption" style={{ marginTop: 6 }}>
              이번 달 프라임 세포는 {CELL_BY_ID[primeCell].name}
              {primeCell === entry.cellId ? ' — 오늘도 수성 중!' : ''}
            </p>
          )}
        </div>
        <div className="reaction-actions">
          <button className="icon-btn" aria-label="공유 카드 만들기" onClick={onShare}>
            <img src={iconPath('share')} alt="" width={36} height={36} />
          </button>
          <button className="icon-btn" aria-label="기록 수정" onClick={onEdit}>
            <img src={iconPath('restart')} alt="" width={36} height={36} />
          </button>
          <button className="icon-btn" aria-label="홈으로" onClick={onHome}>
            <img src={iconPath('home')} alt="" width={36} height={36} />
          </button>
        </div>
      </div>
    </div>
  );
}
