import type { LinkScanResult } from '../shared/types';

function showPasteWarningToast(url: string, result: LinkScanResult): void {
  document.getElementById('shieldai-paste-toast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'shieldai-paste-toast';
  const color = result.threatScore >= 70 ? '#ef4444' : '#f59e0b';
  toast.style.cssText = [
    'position:fixed',
    'bottom:24px',
    'right:24px',
    'z-index:2147483647',
    'background:#1e293b',
    `border:1px solid ${color}`,
    'color:#f1f5f9',
    'padding:12px 16px',
    'border-radius:8px',
    'font-family:ui-monospace,monospace',
    'font-size:12px',
    'max-width:320px',
    'box-shadow:0 4px 20px rgba(0,0,0,0.5)',
  ].join(';');

  const title = document.createElement('div');
  title.style.cssText = `color:${color};font-weight:600;margin-bottom:4px;`;
  title.textContent = `⚠ ShieldAI: Pasted URL flagged (${result.threatScore}/100)`;

  const sub = document.createElement('div');
  sub.style.cssText = 'color:#94a3b8;font-size:11px;word-break:break-all;';
  sub.textContent = url.length > 60 ? `${url.slice(0, 60)}…` : url;

  const reasons = document.createElement('div');
  reasons.style.cssText = 'margin-top:8px;font-size:11px;color:#cbd5e1;';
  reasons.textContent = (result.reasons?.slice(0, 2) ?? [])
    .map((r) => `• ${r.label}`)
    .join('\n');

  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = '✕';
  close.style.cssText =
    'position:absolute;top:8px;right:8px;background:none;border:none;color:#64748b;cursor:pointer;font-size:14px;';
  close.addEventListener('click', () => toast.remove());

  toast.append(close, title, sub, reasons);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 8000);
}

export function initClipboardMonitor(): void {
  document.addEventListener(
    'paste',
    (e) => {
      const text = e.clipboardData?.getData('text')?.trim() ?? '';
      if (!text.startsWith('http')) return;
      void chrome.runtime.sendMessage({ type: 'SCAN_URL', url: text }).then((result) => {
        const r = result as LinkScanResult;
        if (r?.threatScore > 40) showPasteWarningToast(text, r);
      });
    },
    true,
  );
}
