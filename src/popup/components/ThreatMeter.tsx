import { COLORS } from '../../shared/constants';

export function ThreatMeter({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 70 ? COLORS.dangerous : pct >= 40 ? COLORS.suspicious : COLORS.safe;
  return (
    <div className="w-full max-w-[200px]">
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="mt-2 text-center font-mono text-sm" style={{ color }}>
        {pct}/100
      </div>
    </div>
  );
}
