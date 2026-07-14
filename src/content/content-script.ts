// content-script.ts — injected into every page
import { GmailScanner } from './gmail-scanner';

const linkStatsCache = { total: 0, suspicious: 0, danger: 0 };

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_LINK_STATS') {
    sendResponse(linkStatsCache);
    return true;
  }
  if (message.type === 'SCAN_NOW') {
    scanAllLinksAndUpdate();
    sendResponse({ ok: true });
    return true;
  }
});

async function scanAllLinksAndUpdate() {
  const anchors = Array.from(document.querySelectorAll('a[href]')).slice(0, 100);
  linkStatsCache.total = anchors.length;
  linkStatsCache.suspicious = 0;
  linkStatsCache.danger = 0;
  for (const a of anchors) {
    const href = (a as HTMLAnchorElement).href;
    if (!href || !href.startsWith('http')) continue;
    try {
      const result = await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: href });
      if (result?.threatScore >= 70) linkStatsCache.danger++;
      else if (result?.threatScore >= 40) linkStatsCache.suspicious++;
      applyLinkStyle(a as HTMLAnchorElement, result);
    } catch { /* skip */ }
  }
  chrome.runtime.sendMessage({ type: 'LINK_STATS_UPDATE', stats: { ...linkStatsCache } }).catch(() => {});
}

async function init() {
  // Guard: skip extension pages
  if (window.location.protocol === 'chrome-extension:' || window.location.protocol === 'chrome:') return;

  const settings = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }).catch(() => null);

  // Clipboard monitor
  if (settings?.enableClipboardMonitor !== false) {
    document.addEventListener('paste', async (e) => {
      const text = e.clipboardData?.getData('text') || '';
      if (!text.startsWith('http')) return;
      const result = await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: text }).catch(() => null);
      if (result?.threatScore > 40) showToast(text, result);
    });
  }

  // Password manager guard
  if (settings?.enablePasswordGuard !== false) {
    const guardPassword = async () => {
      const result = await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: window.location.href }).catch(() => null);
      if (result?.threatScore >= 70) showPasswordWarning(result.threatScore);
    };
    document.querySelectorAll('input[type="password"]').forEach(el => el.addEventListener('focus', guardPassword, { once: true }));
    new MutationObserver(() => {
      document.querySelectorAll('input[type="password"]:not([data-sg])').forEach(el => {
        (el as HTMLElement).dataset.sg = '1';
        el.addEventListener('focus', guardPassword, { once: true });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }

  // Scan current page URL
  const pageResult = await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: window.location.href }).catch(() => null);
  if (pageResult?.threatScore >= 40) showWarningBanner(pageResult);

  const { injectPageBadge } = await import('./page-badge');
  injectPageBadge(pageResult?.threatScore ?? 0);

  // Scan all links automatically on load
  window.addEventListener('load', () => {
    setTimeout(() => scanAllLinksAndUpdate(), 2000);
  });
  // Also run immediately for already-loaded pages
  if (document.readyState === 'complete') {
    setTimeout(() => scanAllLinksAndUpdate(), 2000);
  }

  // Gmail-specific
  if (window.location.hostname === 'mail.google.com' && settings?.scanGmail !== false) {
    
    new GmailScanner().start();
  }

  // QR scan (async, non-blocking)
  if (settings?.enableQRScanning !== false) {
    import('../analyzers/qr-code-scanner').then(m => m.scanPageForQRCodes()).catch(() => {});
  }

  // OCR scan (async, non-blocking)
  if (settings?.enableOCRScanning !== false) {
    import('../analyzers/ocr-scanner').then(m => m.scanAllImagesOnPage()).catch(() => {});
  }
}

function applyLinkStyle(a: HTMLAnchorElement, result: any) {
  const color = result.threatScore >= 70 ? '#ef4444' : result.threatScore >= 40 ? '#f59e0b' : null;
  if (!color) return;
  a.style.outline = `2px solid ${color}`;
  a.title = `ShieldAI: ${result.threatScore}/100 — ${(result.reasons || []).map((r: any) => r.label).join(', ')}`;
}

function showWarningBanner(result: any) {
  if (document.getElementById('shieldai-banner')) return;
  const color = result.threatScore >= 70 ? '#ef4444' : '#f59e0b';
  const div = document.createElement('div');
  div.id = 'shieldai-banner';
  div.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#1e293b;border-bottom:2px solid ${color};color:#f1f5f9;padding:10px 16px;font-family:monospace;font-size:12px;display:flex;justify-content:space-between;align-items:center;`;
  div.innerHTML = `<span>🛡️ ShieldAI: <strong style="color:${color}">Threat detected (${result.threatScore}/100)</strong> — ${(result.reasons || []).slice(0, 2).map((r: any) => r.label).join(', ')}</span><button style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;" onclick="this.parentElement.remove()">✕</button>`;
  document.body.prepend(div);
}

function showPasswordWarning(score: number) {
  if (document.getElementById('shieldai-pw')) return;
  const div = document.createElement('div');
  div.id = 'shieldai-pw';
  div.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#7f1d1d;color:#fca5a5;padding:12px 20px;font-family:monospace;font-size:12px;display:flex;justify-content:space-between;align-items:center;`;
  div.innerHTML = `<span>🔐 ShieldAI: Password entry on suspicious page (${score}/100). This may be phishing.</span><div style="display:flex;gap:8px"><button style="background:#dc2626;border:none;color:white;padding:4px 12px;border-radius:4px;cursor:pointer;font-family:monospace;" id="shieldai-pw-dismiss">I know the risk</button><button style="background:none;border:1px solid #fca5a5;color:#fca5a5;padding:4px 12px;border-radius:4px;cursor:pointer;font-family:monospace;" onclick="history.back()">Go Back</button></div>`;
  document.body.prepend(div);
  document.getElementById('shieldai-pw-dismiss')?.addEventListener('click', () => div.remove());
}

function showToast(url: string, result: any) {
  const existing = document.getElementById('shieldai-toast');
  if (existing) existing.remove();
  const color = result.threatScore >= 70 ? '#ef4444' : '#f59e0b';
  const div = document.createElement('div');
  div.id = 'shieldai-toast';
  div.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:2147483647;background:#1e293b;border:1px solid ${color};color:#f1f5f9;padding:12px 16px;border-radius:8px;font-family:monospace;font-size:12px;max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,0.5);`;
  div.innerHTML = `<div style="color:${color};font-weight:600;margin-bottom:4px;">⚠ Pasted URL flagged (${result.threatScore}/100)</div><div style="color:#94a3b8;font-size:11px;word-break:break-all">${url.slice(0, 60)}${url.length > 60 ? '…' : ''}</div><button style="position:absolute;top:6px;right:8px;background:none;border:none;color:#64748b;cursor:pointer;" onclick="this.parentElement.remove()">✕</button>`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 8000);
}

init().catch(console.error);
