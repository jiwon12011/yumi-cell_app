import { cardBgPath, poseMidPath } from '../data/assets';
import type { CardBgName } from '../data/assets';
import { CELL_BY_ID, INTENSITY_LABEL } from '../data/cells';
import { formatKorean } from '../logic/dateUtils';
import { pickComment } from '../logic/pickComment';
import type { DiaryEntry } from '../logic/types';

export const CARD_SIZE = 1080;

const FONT_DISPLAY = "'Jua', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`이미지 로드 실패: ${src}`));
    img.src = src;
  });
}

/** measureText 기반 줄바꿈 — 최대 2줄, 넘치면 말줄임 (기획서 §4.6) */
export function wrapNote(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2,
): string[] {
  if (!text) return [];
  const chars = Array.from(text);
  const lines: string[] = [];
  let line = '';
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch;
      if (lines.length === maxLines) break;
    } else {
      line += ch;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && line && !lines.includes(line)) {
    // 넘친 경우 마지막 줄 말줄임
    let last = lines[maxLines - 1];
    while (ctx.measureText(last + '…').width > maxWidth && last) {
      last = Array.from(last).slice(0, -1).join('');
    }
    lines[maxLines - 1] = last + '…';
  }
  return lines;
}

/**
 * 1080×1080 공유 카드 그리기 (기획서 §4.6 레이아웃).
 * 폰트는 호출 전 document.fonts.load 대기 — 실패해도 폴백 스택으로 그려진다.
 */
export async function drawShareCard(
  canvas: HTMLCanvasElement,
  entry: DiaryEntry,
  cardBg: CardBgName,
): Promise<void> {
  canvas.width = CARD_SIZE;
  canvas.height = CARD_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d 컨텍스트 없음');

  try {
    await document.fonts.load(`48px ${FONT_DISPLAY}`, '가');
  } catch {
    // 폰트 미로드 시 시스템 폴백으로 진행
  }

  const cell = CELL_BY_ID[entry.cellId];
  const [bg, pose] = await Promise.all([
    loadImage(cardBgPath(cardBg)),
    loadImage(poseMidPath(entry.cellId, entry.poseIndex)),
  ]);

  // 1. 프레임 배경
  ctx.drawImage(bg, 0, 0, CARD_SIZE, CARD_SIZE);

  // 1.5 오늘의 대사 말풍선 — 상단 중앙 (회의 연출과 동일한 멘트)
  const comment = pickComment(entry.cellId, entry.intensity, entry.date);
  ctx.font = `44px ${FONT_DISPLAY}`;
  const cw = ctx.measureText(comment).width;
  const bubble = {
    w: Math.min(cw + 96, CARD_SIZE - 120),
    h: 110,
    y: 64,
  };
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.strokeStyle = `${cell.color}66`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect((CARD_SIZE - bubble.w) / 2, bubble.y, bubble.w, bubble.h, 55);
  ctx.fill();
  ctx.stroke();
  // 말풍선 꼬리
  ctx.beginPath();
  ctx.moveTo(CARD_SIZE / 2 - 18, bubble.y + bubble.h - 2);
  ctx.lineTo(CARD_SIZE / 2, bubble.y + bubble.h + 26);
  ctx.lineTo(CARD_SIZE / 2 + 18, bubble.y + bubble.h - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#4A3B47';
  let commentLine = comment;
  while (ctx.measureText(commentLine).width > bubble.w - 72 && commentLine) {
    commentLine = Array.from(commentLine).slice(0, -1).join('');
  }
  if (commentLine !== comment) commentLine += '…';
  ctx.fillText(commentLine, CARD_SIZE / 2, bubble.y + bubble.h / 2);

  // 2. 세포 포즈 — 말풍선 아래 (y 230~700 영역)
  const zone = { x: CARD_SIZE / 2, top: 230, h: 470 };
  const scale = Math.min(zone.h / pose.height, (CARD_SIZE * 0.55) / pose.width);
  const pw = pose.width * scale;
  const ph = pose.height * scale;
  ctx.save();
  ctx.shadowColor = 'rgba(74, 59, 71, 0.25)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 16;
  ctx.drawImage(pose, zone.x - pw / 2, zone.top + (zone.h - ph) / 2, pw, ph);
  ctx.restore();

  // 3. 하단 반투명 패널
  const panel = { x: 60, y: 740, w: 960, h: 280, r: 40 };
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.w, panel.h, panel.r);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 4. 노트 (최대 2줄)
  ctx.font = `48px ${FONT_DISPLAY}`;
  ctx.fillStyle = '#4A3B47';
  const noteLines = wrapNote(ctx, entry.note, panel.w - 120);
  const noteBase = panel.y + (noteLines.length > 1 ? 86 : 104);
  noteLines.forEach((line, i) => {
    ctx.fillText(line, CARD_SIZE / 2, noteBase + i * 62);
  });

  // 5. 날짜 + 세포 이름
  ctx.font = `36px ${FONT_DISPLAY}`;
  ctx.fillStyle = cell.color;
  ctx.fillText(
    `${formatKorean(entry.date)} · ${cell.name} (${INTENSITY_LABEL[entry.intensity]})`,
    CARD_SIZE / 2,
    panel.y + panel.h - 72,
  );

  // 6. 워터마크
  ctx.font = `24px ${FONT_DISPLAY}`;
  ctx.fillStyle = '#9A8B96';
  ctx.textAlign = 'right';
  ctx.fillText('세포 감정일기', panel.x + panel.w - 32, panel.y + panel.h - 30);
}
