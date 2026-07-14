import type { LinkScanResult } from '../shared/types';

function showPasswordWarning(url: string, score: number): void {
  if (document.getElementById('shieldai-pw-guard')) return;
  const banner = document.createElement('div');
  banner.id = 'shieldai-pw-guard';
  banner.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'z-index:2147483647',
    'background:#7f1d1d',
    'color:#fca5a5',
    'padding:14px 20px',
    'font-family:ui-monospace,monospace',
    'font-size:13px',
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'flex-wrap:wrap',
    'gap:10px',
    'box-shadow:0 2px 20px rgba(0,0,0,0.6)',
  ].join(';');

  const msg = document.createElement('span');
  msg.innerHTML = `🔐 <strong>ShieldAI Warning:</strong> Your password manager may fill credentials on a page scoring <strong>${score}/100</strong> threat risk. URL: ${url.slice(0, 80)}`;

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:10px;';

  const btnRisk = document.createElement('button');
  btnRisk.type = 'button';
  btnRisk.textContent = 'I know the risk';
  btnRisk.style.cssText =
    'background:#dc2626;border:none;color:white;padding:6px 14px;border-radius:4px;cursor:pointer;font-family:inherit;';
  btnRisk.addEventListener('click', () => banner.remove());

  const btnBack = document.createElement('button');
  btnBack.type = 'button';
  btnBack.textContent = 'Go Back';
  btnBack.style.cssText =
    'background:none;border:1px solid #fca5a5;color:#fca5a5;padding:6px 14px;border-radius:4px;cursor:pointer;font-family:inherit;';
  btnBack.addEventListener('click', () => window.history.back());

  actions.append(btnRisk, btnBack);
  banner.append(msg, actions);
  document.body.prepend(banner);
}

function attachGuard(input: HTMLInputElement): void {
  if (input.dataset.shieldaiGuarded === '1') return;
  input.dataset.shieldaiGuarded = '1';
  input.addEventListener(
    'focus',
    () => {
      const pageUrl = window.location.href;
      void chrome.runtime.sendMessage({ type: 'SCAN_URL', url: pageUrl }).then((raw) => {
        const result = raw as LinkScanResult;
        if (result?.threatScore >= 70) showPasswordWarning(pageUrl, result.threatScore);
      });
    },
    { passive: true },
  );
}

export function initPasswordManagerGuard(): void {
  document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach(attachGuard);

  const observer = new MutationObserver(() => {
    document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach(attachGuard);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
}
