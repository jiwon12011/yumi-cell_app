interface Props {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: Props) {
  const ratio = max > 0 ? value / max : 0;
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`진행도 ${value} / ${max}`}
    >
      {/* width 대신 transform: scaleX (perf §6) */}
      <div className="progress__fill" style={{ transform: `scaleX(${ratio})` }} />
    </div>
  );
}
