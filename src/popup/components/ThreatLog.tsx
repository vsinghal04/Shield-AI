import { useMemo, useState } from 'react';
import type { ThreatLogEntry } from '../../shared/types';

export function ThreatLog({ entries }: { entries: ThreatLogEntry[] }) {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return entries.filter(
      (e) =>
        !s ||
        (e.url?.toLowerCase().includes(s) ?? false) ||
        (e.pageTitle?.toLowerCase().includes(s) ?? false),
    );
  }, [entries, q]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shieldai-threat-log.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function openHtmlReport() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const res = (await chrome.runtime.sendMessage({
      type: 'GENERATE_REPORT',
      dateRange: { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) },
    })) as { html?: string; error?: string };
    if (res?.error) {
      console.error('[ShieldAI] Report:', res.error);
      return;
    }
    if (!res?.html) return;
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(res.html)}`;
    await chrome.tabs.create({ url: dataUrl });
  }

  function exportCsv() {
    const rows = [['id', 'timestamp', 'url', 'score', 'level', 'categories'].join(',')].concat(
      filtered.map((e) =>
        [
          e.id,
          e.timestamp,
          JSON.stringify(e.url ?? ''),
          e.threatScore,
          e.threatLevel,
          JSON.stringify(e.categories.join('|')),
        ].join(','),
      ),
    );
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shieldai-threat-log.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const stats = useMemo(() => {
    const total = entries.length;
    const blocked = entries.filter((e) => e.threatLevel === 'dangerous').length;
    const byCat: Record<string, number> = {};
    for (const e of entries) {
      for (const c of e.categories) byCat[c] = (byCat[c] ?? 0) + 1;
    }
    return { total, blocked, byCat };
  }, [entries]);

  return (
    <div className="space-y-3 text-[13px]">
      <input
        className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
        placeholder="Search URL or title…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white"
          onClick={exportJson}
        >
          Export JSON
        </button>
        <button
          type="button"
          className="rounded border border-slate-600 px-3 py-1.5 text-xs text-slate-200"
          onClick={() => void openHtmlReport()}
        >
          HTML report
        </button>
        <button
          type="button"
          className="rounded border border-slate-600 px-3 py-1.5 text-xs text-slate-200"
          onClick={exportCsv}
        >
          Export CSV
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Total', value: stats.total, color: '#6366f1' },
          { label: 'Danger', value: entries.filter((l: any) => l.threatScore >= 70).length, color: '#ef4444' },
          { label: 'Suspicious', value: entries.filter((l: any) => l.threatScore >= 40 && l.threatScore < 70).length, color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#1e293b', borderRadius: '8px', padding: '10px',
            textAlign: 'center', border: `1px solid ${stat.color}33`
          }}>
            <div style={{ color: stat.color, fontSize: '20px', fontWeight: '700' }}>{stat.value}</div>
            <div style={{ color: '#475569', fontSize: '10px', letterSpacing: '1px' }}>{stat.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <ul className="max-h-48 space-y-1 overflow-auto pr-1">
        {filtered.map((e) => (
          <li key={e.id} className="rounded border border-slate-700/60 bg-slate-900/40 px-2 py-1 font-mono text-[11px]">
            <div className="flex justify-between gap-2">
              <span className="truncate text-slate-300">{e.url ?? e.pageTitle}</span>
              <span className="text-slate-500">{e.threatScore}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
