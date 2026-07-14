import { useEffect, useState } from "react";

export function Dashboard() {
  const [pageScore, setPageScore] = useState<number | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  const [linkStats, setLinkStats] = useState({ total: 0, suspicious: 0, danger: 0 });
  const [recentThreats, setRecentThreats] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab?.url || !tab?.id) return;
      setPageUrl(tab.url);

      // Scan page URL via background
      const result = await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: tab.url });
      if (result?.threatScore !== undefined) setPageScore(result.threatScore);

      // Try content script first, fall back to DOM injection via scripting API
      chrome.tabs.sendMessage(tab.id, { type: 'GET_LINK_STATS' }, async (stats) => {
        if (chrome.runtime.lastError || !stats) {
          // Fallback: use scripting API to count links directly
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tab.id! },
              func: () => {
                const links = Array.from(document.querySelectorAll('a[href]'))
                  .map(a => (a as HTMLAnchorElement).href)
                  .filter(h => h.startsWith('http'));
                return { total: links.length, links: links.slice(0, 50) };
              }
            });
            const data = results?.[0]?.result as any;
            if (data) {
              setLinkStats(s => ({ ...s, total: data.total }));
              // Scan sampled links to get suspicious/danger counts
              let suspicious = 0, danger = 0;
              for (const url of (data.links || [])) {
                const r = await chrome.runtime.sendMessage({ type: 'SCAN_URL', url });
                if (r?.threatScore >= 70) danger++;
                else if (r?.threatScore >= 40) suspicious++;
              }
              setLinkStats({ total: data.total, suspicious, danger });
            }
          } catch { /* scripting not available on this page */ }
          return;
        }
        setLinkStats(stats);
      });
    });

    chrome.runtime.sendMessage({ type: 'GET_THREAT_LOG' }, (log) => {
      if (log && Array.isArray(log)) setRecentThreats(log.slice(0, 8));
    });

    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (s) => {
      if (s) setSettings(s);
    });

    const listener = (msg: any) => {
      if (msg.type === 'LINK_STATS_UPDATE') setLinkStats(msg.stats);
      if (msg.type === 'PAGE_SCORE_UPDATE') setPageScore(msg.score);
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const scoreColor = pageScore === null ? '#6366f1'
    : pageScore >= 70 ? '#ef4444'
    : pageScore >= 40 ? '#f59e0b'
    : '#22c55e';

  const scoreLabel = pageScore === null ? 'Scanning...'
    : pageScore >= 70 ? 'DANGEROUS'
    : pageScore >= 40 ? 'SUSPICIOUS'
    : 'SAFE';

  const handleScanPage = async () => {
    setScanning(true);
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'SCAN_NOW' });
      const pollStats = (tabId: number, times = 5) => {
        chrome.tabs.sendMessage(tabId, { type: 'GET_LINK_STATS' }, (stats) => {
          if (stats) setLinkStats(stats);
          if (times > 1) setTimeout(() => pollStats(tabId, times - 1), 1000);
        });
      };
      pollStats(tab.id);
      setTimeout(async () => {
        const log = await chrome.runtime.sendMessage({ type: 'GET_THREAT_LOG' });
        if (log) setRecentThreats(log.slice(0, 8));
        setScanning(false);
      }, 3000);
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'monospace' }}>
      {/* Score Hero Card */}
      <div style={{
        background: '#1e293b', borderRadius: '12px', padding: '20px',
        marginBottom: '12px', border: `1px solid ${scoreColor}22`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', letterSpacing: '1px' }}>CURRENT PAGE</div>
          <div style={{ color: scoreColor, fontSize: '32px', fontWeight: '700', lineHeight: 1 }}>
            {pageScore ?? '—'}<span style={{ fontSize: '16px', color: '#475569' }}>/100</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '600', color: scoreColor, letterSpacing: '1px' }}>
            {scoreLabel}
          </div>
          <div style={{ marginTop: '4px', fontSize: '10px', color: '#475569', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {pageUrl}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '8px', letterSpacing: '1px' }}>LINKS</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9' }}>{linkStats.total}</div>
          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '4px' }}>⚠ {linkStats.suspicious} suspicious</div>
          <div style={{ fontSize: '11px', color: '#ef4444' }}>✕ {linkStats.danger} dangerous</div>
        </div>
      </div>

      {/* Protection Mode */}
      <div style={{
        background: '#1e293b', borderRadius: '8px', padding: '10px 16px',
        marginBottom: '12px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', border: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: settings?.protectionMode === 'aggressive' ? '#ef4444' : settings?.protectionMode === 'passive' ? '#94a3b8' : '#22c55e',
            boxShadow: `0 0 6px ${settings?.protectionMode === 'aggressive' ? '#ef4444' : '#22c55e'}`
          }} />
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>Protection</span>
        </div>
        <span style={{ color: '#6366f1', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
          {settings?.protectionMode || 'Standard'}
        </span>
      </div>

      {/* Scan Button */}
      <button onClick={handleScanPage} disabled={scanning} style={{
        width: '100%', padding: '12px', borderRadius: '8px',
        background: scanning ? '#334155' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
        color: 'white', border: 'none', cursor: scanning ? 'not-allowed' : 'pointer',
        fontSize: '13px', fontWeight: '600', fontFamily: 'monospace',
        marginBottom: '16px', letterSpacing: '0.5px'
      }}>
        {scanning ? '⟳ Scanning...' : '🔍 Scan This Page'}
      </button>

      {/* Recent Threats */}
      <div style={{ color: '#94a3b8', fontSize: '10px', letterSpacing: '1px', marginBottom: '8px' }}>
        RECENT THREATS
      </div>
      {recentThreats.length === 0 ? (
        <div style={{ color: '#475569', fontSize: '12px', padding: '12px', textAlign: 'center', background: '#1e293b', borderRadius: '8px' }}>
          ✓ No threats logged yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {recentThreats.map((t, i) => {
            const color = t.threatScore >= 70 ? '#ef4444' : t.threatScore >= 40 ? '#f59e0b' : '#22c55e';
            return (
              <div key={i} style={{
                background: '#1e293b', borderRadius: '8px', padding: '10px 12px',
                border: `1px solid ${color}33`, display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                    {t.url || t.text || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>
                    {(t.reasons || []).slice(0, 2).map((r: any) => r.label).join(' · ')}
                  </div>
                </div>
                <div style={{ color, fontSize: '13px', fontWeight: '700', minWidth: '36px', textAlign: 'right' }}>
                  {t.threatScore}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
