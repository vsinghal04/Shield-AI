import { useCallback, useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { QuickScan } from './components/QuickScan';
import { ThreatLog } from './components/ThreatLog';
import { SettingsPanel } from './components/SettingsPanel';
import type { ExtensionSettings, ThreatLogEntry } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';
import { getSettings, saveSettings } from '../shared/storage';

type Tab = 'home' | 'scan' | 'history' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);
  const [logs, setLogs] = useState<ThreatLogEntry[]>([]);
  const [summary, setSummary] = useState({
    pageScore: 0,
    linksFound: 0,
    suspicious: 0,
    danger: 0,
  });

  const refresh = useCallback(async () => {
    const s = await getSettings();
    setSettings(s);
    const l = await chrome.runtime.sendMessage({ type: 'GET_THREAT_LOG' }).catch(() => []);
    setLogs(Array.isArray(l) ? l.slice(0, 20) : []);
    const st = await chrome.storage.local.get('shieldai_last_page_summary');
    const p = st.shieldai_last_page_summary as
      | {
          pageThreatScore?: number;
          linksFound?: number;
          suspiciousCount?: number;
          dangerCount?: number;
        }
      | undefined;
    if (p) {
      setSummary({
        pageScore: p.pageThreatScore ?? 0,
        linksFound: p.linksFound ?? 0,
        suspicious: p.suspiciousCount ?? 0,
        danger: p.dangerCount ?? 0,
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function updateSettings(p: Partial<ExtensionSettings>) {
    await saveSettings(p);
    setSettings((prev) => ({ ...prev, ...p }));
  }

  async function scanThisPage() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url) {
      chrome.runtime.sendMessage({ type: 'SCAN_URL', url: tab.url })
        .then((result) => {
          if (result && typeof result.threatScore === 'number') {
            setSummary(prev => ({ ...prev, pageScore: result.threatScore }));
          }
        })
        .catch(console.error);
    }
  }

  return (
    <div className="flex min-h-[560px] min-w-[380px] max-w-[800px] flex-col bg-shield-bg text-slate-100">
      <header className="border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-semibold tracking-tight text-slate-100">ShieldAI</h1>
          <span className="font-mono text-[11px] text-slate-500">v1.0.0</span>
        </div>
        <nav className="mt-3 flex gap-1">
          {(
            [
              ['home', 'Home'],
              ['scan', 'Scan'],
              ['history', 'History'],
              ['settings', 'Settings'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                tab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>
      <main className="flex-1 overflow-auto px-4 py-3">
        {tab === 'home' && (
          <Dashboard />
        )}
        {tab === 'scan' && <QuickScan />}
        {tab === 'history' && <ThreatLog entries={logs} />}
        {tab === 'settings' && <SettingsPanel settings={settings} onChange={updateSettings} />}
      </main>
    </div>
  );
}
