import type { LinkScanResult } from '../shared/types';

const BANNER_ID = 'shieldai-page-banner';

export function showPageBanner(suspicious: number, dangerous: number, onDetails?: () => void): void {
  if (document.getElementById(BANNER_ID)) return;
  const bar = document.createElement('div');
  bar.id = BANNER_ID;
  bar.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'z-index:2147483645',
    'background:linear-gradient(90deg,#1e293b,#0f172a)',
    'color:#f1f5f9',
    'padding:10px 14px',
    'font:13px/1.4 Inter,system-ui,sans-serif',
    'border-bottom:1px solid #334155',
    'display:flex',
    'align-items:center',
    'gap:12px',
    'animation:shieldai-slide .25s ease',
  ].join(';');
  bar.innerHTML = `
    <span>⚠️ <strong>ShieldAI:</strong> This page contains suspicious links.
    <span style="color:#ef4444">${dangerous} dangerous</span>,
    <span style="color:#f59e0b">${suspicious} suspicious</span>.</span>
    <button type="button" data-details style="margin-left:auto;background:#6366f1;color:#fff;border:0;border-radius:6px;padding:6px 10px;cursor:pointer">View details</button>
    <button type="button" data-dismiss style="background:transparent;color:#94a3b8;border:1px solid #475569;border-radius:6px;padding:6px 10px;cursor:pointer">Dismiss</button>
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes shieldai-slide{from{transform:translateY(-100%)}to{transform:translateY(0)}}`;
  document.documentElement.appendChild(style);
  document.documentElement.appendChild(bar);
  bar.querySelector('[data-dismiss]')?.addEventListener('click', () => bar.remove());
  bar.querySelector('[data-details]')?.addEventListener('click', () => onDetails?.());
}

export function removePageBanner(): void {
  document.getElementById(BANNER_ID)?.remove();
}

export function initWarningBanner(pageResult: LinkScanResult): void {
  if (pageResult.threatScore < 40) return;
  const dangerous = pageResult.threatLevel === 'dangerous' ? 1 : 0;
  const suspicious = pageResult.threatLevel === 'suspicious' || pageResult.threatLevel === 'dangerous' ? 1 : 0;
  showPageBanner(Math.max(suspicious, dangerous ? 0 : 1), dangerous);
}
