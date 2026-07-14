import type { LinkScanResult } from '../../shared/types';
import { StatusBadge } from './StatusBadge';

export function ScanResult({ result }: { result: LinkScanResult }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-left">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[11px] text-slate-400">{result.url}</span>
        <StatusBadge level={result.threatLevel} />
      </div>
      <ul className="space-y-1 text-[12px] text-slate-300">
        {result.reasons.slice(0, 4).map((r) => (
          <li key={r.code}>
            <span className="text-slate-500">{r.code}:</span> {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
