import { useState } from 'react';
import type { LinkScanResult, TextAnalysisResult } from '../../shared/types';
import { ScanResult } from './ScanResult';

type Mode = 'url' | 'text' | 'email';

export function QuickScan() {
  const [mode, setMode] = useState<Mode>('url');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkResult, setLinkResult] = useState<LinkScanResult | null>(null);
  const [textResult, setTextResult] = useState<TextAnalysisResult | null>(null);

  async function run() {
    setLoading(true);
    setLinkResult(null);
    setTextResult(null);
    try {
      if (mode === 'url') {
        const r = (await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: input })) as LinkScanResult;
        setLinkResult(r);
      } else {
        const r = (await chrome.runtime.sendMessage({ type: 'SCAN_TEXT', text: input })) as TextAnalysisResult;
        setTextResult(r);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 text-[13px]">
      <div className="flex gap-2">
        {(['url', 'text', 'email'] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`rounded px-2 py-1 text-xs capitalize ${
              mode === m ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
            onClick={() => setMode(m)}
          >
            {m === 'email' ? 'Email (text)' : m}
          </button>
        ))}
      </div>
      <textarea
        className="min-h-[100px] w-full rounded border border-slate-600 bg-slate-900 px-2 py-1.5 font-mono text-xs"
        placeholder={mode === 'url' ? 'https://...' : 'Paste message text…'}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        type="button"
        disabled={loading || !input.trim()}
        className="w-full rounded bg-indigo-600 py-2 text-sm font-medium text-white disabled:opacity-50"
        onClick={() => void run()}
      >
        {loading ? 'Scanning…' : 'Scan'}
      </button>
      {linkResult && <ScanResult result={linkResult} />}
      {textResult && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/80 p-3 text-left text-xs text-slate-300">
          <div>Score: {textResult.overallScore}</div>
          <div>Urgency: {textResult.urgencyLevel}/10</div>
          <div>Tactics: {textResult.tactics.join(', ') || '—'}</div>
        </div>
      )}
    </div>
  );
}
