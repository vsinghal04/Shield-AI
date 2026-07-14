export function injectPageBadge(score: number) {
  const existing = document.getElementById('shieldai-badge');
  if (existing) existing.remove();

  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
  const icon = score >= 70 ? '🛡' : score >= 40 ? '⚠' : '✓';

  const badge = document.createElement('div');
  badge.id = 'shieldai-badge';
  badge.style.cssText = `
    position:fixed;bottom:20px;left:20px;z-index:2147483647;
    background:#1e293b;border:1.5px solid ${color};border-radius:20px;
    padding:6px 12px;font-family:monospace;font-size:12px;
    color:${color};font-weight:700;cursor:pointer;
    box-shadow:0 2px 12px rgba(0,0,0,0.4);
    display:flex;align-items:center;gap:6px;user-select:none;
  `;
  badge.innerHTML = `${icon} <span style="color:#f1f5f9">ShieldAI</span> <span style="color:${color}">${score}</span>`;
  badge.title = 'Click to open ShieldAI';
  badge.onclick = () => chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
  document.body.appendChild(badge);
  if (score < 40) setTimeout(() => { badge.style.opacity = '0.3'; }, 5000);
}
