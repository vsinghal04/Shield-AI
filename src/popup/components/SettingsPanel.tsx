import type { ExtensionSettings } from '../../shared/types';

export function SettingsPanel({
  settings,
  onChange,
}: {
  settings: ExtensionSettings;
  onChange: (p: Partial<ExtensionSettings>) => void;
}) {
  return (
    <div className="space-y-3 text-[13px]">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => chrome.runtime.sendMessage({ type: 'REFRESH_FEEDS' })} style={{
          background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
          padding: '10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '11px', fontFamily: 'monospace'
        }}>⟳ Refresh Feeds</button>

        <button onClick={async () => {
          const r = await chrome.runtime.sendMessage({ type: 'SCAN_HISTORY' });
          alert(`Scanned ${r.scannedCount} URLs.\nFound ${r.threatsFound} threats in history.`);
        }} style={{
          background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
          padding: '10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '11px', fontFamily: 'monospace'
        }}>📋 Scan History</button>

        <button onClick={async () => {
          const r = await chrome.runtime.sendMessage({ type: 'GENERATE_REPORT', dateRange: { from: '', to: '' } });
          const w = window.open('', '_blank');
          if (w) { w.document.write(r.html); w.document.close(); }
        }} style={{
          background: '#1e293b', border: '1px solid #334155', color: '#94a3b8',
          padding: '10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '11px', fontFamily: 'monospace'
        }}>📊 Export Report</button>

        <button onClick={() => {
          if (confirm('Clear all threat logs?')) chrome.storage.local.clear(() => alert('Cleared.'));
        }} style={{
          background: '#1e293b', border: '1px solid #7f1d1d', color: '#ef4444',
          padding: '10px', borderRadius: '8px', cursor: 'pointer',
          fontSize: '11px', fontFamily: 'monospace'
        }}>🗑 Clear Log</button>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Protection mode</span>
        <select
          className="rounded border border-slate-600 bg-slate-900 px-2 py-1.5"
          value={settings.protectionMode}
          onChange={(e) =>
            onChange({ protectionMode: e.target.value as ExtensionSettings['protectionMode'] })
          }
        >
          <option value="passive">Passive</option>
          <option value="standard">Standard</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Privacy mode (no external APIs / no remote NLP)</span>
        <input
          type="checkbox"
          checked={settings.privacyMode}
          onChange={(e) => onChange({ privacyMode: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>ML URL model (ONNX)</span>
        <input
          type="checkbox"
          checked={settings.enableMLScanning}
          onChange={(e) => onChange({ enableMLScanning: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>VirusTotal enrichment</span>
        <input
          type="checkbox"
          checked={settings.enableVirusTotal}
          onChange={(e) => onChange({ enableVirusTotal: e.target.checked })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">VirusTotal API key (v3)</span>
        <input
          className="rounded border border-slate-600 bg-slate-900 px-2 py-1.5 font-mono text-xs"
          value={settings.virusTotalApiKey}
          onChange={(e) => onChange({ virusTotalApiKey: e.target.value })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Google Safe Browsing</span>
        <input
          type="checkbox"
          checked={settings.enableGoogleSafeBrowsing}
          onChange={(e) => onChange({ enableGoogleSafeBrowsing: e.target.checked })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Safe Browsing API key</span>
        <input
          className="rounded border border-slate-600 bg-slate-900 px-2 py-1.5 font-mono text-xs"
          value={settings.safeBrowsingApiKey}
          onChange={(e) => onChange({ safeBrowsingApiKey: e.target.value })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Link tooltips</span>
        <input
          type="checkbox"
          checked={settings.showLinkTooltips}
          onChange={(e) => onChange({ showLinkTooltips: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Highlight suspicious links</span>
        <input
          type="checkbox"
          checked={settings.highlightSuspiciousLinks}
          onChange={(e) => onChange({ highlightSuspiciousLinks: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Scan Gmail</span>
        <input
          type="checkbox"
          checked={settings.scanGmail}
          onChange={(e) => onChange({ scanGmail: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Scan Outlook Web</span>
        <input
          type="checkbox"
          checked={settings.scanOutlook}
          onChange={(e) => onChange({ scanOutlook: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Expand short URLs (background)</span>
        <input
          type="checkbox"
          checked={settings.autoExpandShortUrls}
          onChange={(e) => onChange({ autoExpandShortUrls: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>QR code scanning</span>
        <input
          type="checkbox"
          checked={settings.enableQRScanning}
          onChange={(e) => onChange({ enableQRScanning: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>OCR image text (Tesseract)</span>
        <input
          type="checkbox"
          checked={settings.enableOCRScanning}
          onChange={(e) => onChange({ enableOCRScanning: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Clipboard paste URL scan</span>
        <input
          type="checkbox"
          checked={settings.enableClipboardMonitor}
          onChange={(e) => onChange({ enableClipboardMonitor: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Password-field guard</span>
        <input
          type="checkbox"
          checked={settings.enablePasswordGuard}
          onChange={(e) => onChange({ enablePasswordGuard: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Browser history exposure scan (opt-in)</span>
        <input
          type="checkbox"
          checked={settings.enableHistoryScan}
          onChange={(e) => onChange({ enableHistoryScan: e.target.checked })}
        />
      </label>
      <label className="flex items-center justify-between gap-2">
        <span>Notifications</span>
        <input
          type="checkbox"
          checked={settings.enableNotifications}
          onChange={(e) => onChange({ enableNotifications: e.target.checked })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Threat threshold (0–100)</span>
        <input
          type="number"
          min={0}
          max={100}
          className="rounded border border-slate-600 bg-slate-900 px-2 py-1.5"
          value={settings.threatThreshold}
          onChange={(e) => onChange({ threatThreshold: Number(e.target.value) })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Mark-safe → auto-allowlist threshold</span>
        <input
          type="number"
          min={1}
          max={10}
          className="rounded border border-slate-600 bg-slate-900 px-2 py-1.5"
          value={settings.autoAllowlistThreshold}
          onChange={(e) => onChange({ autoAllowlistThreshold: Number(e.target.value) })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-slate-400">Trusted domains (typosquat watchlist)</span>
        <textarea
          className="min-h-[60px] rounded border border-slate-600 bg-slate-900 px-2 py-1.5 font-mono text-xs"
          placeholder="one domain per line"
          value={settings.trustedDomains.join('\n')}
          onChange={(e) =>
            onChange({
              trustedDomains: e.target.value
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </label>
    </div>
  );
}
