import type { LinkScanResult } from '../../shared/types';

export function StatusBadge({ level }: { level: LinkScanResult['threatLevel'] }) {
  const map = {
    safe: { bg: '#14532d', fg: '#22c55e', label: 'Safe' },
    suspicious: { bg: '#78350f', fg: '#f59e0b', label: 'Suspicious' },
    dangerous: { bg: '#7f1d1d', fg: '#ef4444', label: 'Dangerous' },
  }[level];
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide"
      style={{ background: map.bg, color: map.fg }}
    >
      {map.label}
    </span>
  );
}
