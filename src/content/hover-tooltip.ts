import type { ExtensionSettings, LinkScanResult } from '../shared/types';
import { getCachedResultForHref } from './link-highlighter';

let tipEl: HTMLDivElement | null = null;

function ensureTip(): HTMLDivElement {
  if (!tipEl) {
    tipEl = document.createElement('div');
    tipEl.id = 'shieldai-hover-tip';
    tipEl.style.cssText = [
      'position:fixed',
      'z-index:2147483646',
      'max-width:320px',
      'padding:8px 10px',
      'border-radius:8px',
      'font:12px/1.4 Inter,system-ui,sans-serif',
      'color:#f1f5f9',
      'background:#0f172a',
      'border:1px solid #334155',
      'box-shadow:0 8px 24px rgba(0,0,0,.35)',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 150ms ease',
    ].join(';');
    document.documentElement.appendChild(tipEl);
  }
  return tipEl;
}

export function showLinkTooltip(x: number, y: number, result: LinkScanResult): void {
  const el = ensureTip();
  const emoji =
    result.threatLevel === 'dangerous' ? '🔴' : result.threatLevel === 'suspicious' ? '🟡' : '🟢';
  const ssl = result.sslValid ? 'SSL ✓' : 'SSL ⚠';
  const age =
    result.domainAge !== undefined ? `Domain age: ~${result.domainAge}d` : 'Domain age: unknown';
  el.innerHTML = `${emoji} <strong>${result.threatLevel.toUpperCase()}</strong><br/>${age} | ${ssl}<br/>Score: ${result.threatScore}/100`;
  el.style.left = `${Math.min(window.innerWidth - 340, x + 12)}px`;
  el.style.top = `${Math.min(window.innerHeight - 80, y + 12)}px`;
  requestAnimationFrame(() => {
    el.style.opacity = '1';
  });
}

export function hideTooltip(): void {
  if (tipEl) tipEl.style.opacity = '0';
}

export function initHoverTooltips(settings: ExtensionSettings): void {
  if (!settings.showLinkTooltips) return;
  document.addEventListener(
    'mouseover',
    (ev) => {
      const t = ev.target as HTMLElement | null;
      const a = t?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a) return;
      let href: string;
      try {
        href = new URL(a.href, location.href).href;
      } catch {
        return;
      }
      if (!href.startsWith('http')) return;
      const cached = getCachedResultForHref(href);
      if (cached) {
        showLinkTooltip(ev.clientX, ev.clientY, cached);
        return;
      }
      void chrome.runtime.sendMessage({ type: 'SCAN_URL', url: href }).then((raw) => {
        const result = raw as LinkScanResult;
        showLinkTooltip(ev.clientX, ev.clientY, result);
      });
    },
    true,
  );
  document.addEventListener(
    'mouseout',
    (ev) => {
      const t = ev.target as HTMLElement | null;
      if (t?.closest?.('a[href]')) hideTooltip();
    },
    true,
  );
}
