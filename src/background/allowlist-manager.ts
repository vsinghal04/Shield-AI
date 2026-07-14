// allowlist-manager.ts — smart auto-learning allowlist

export async function isAllowlisted(url: string): Promise<boolean> {
  try {
    const domain = new URL(url).hostname;
    const { allowlist = {} } = await chrome.storage.sync.get('allowlist');
    const entry = (allowlist as any)[domain];
    if (!entry) return false;
    return entry.trusted || entry.markSafeCount >= 3;
  } catch { return false; }
}

export async function recordMarkSafe(url: string): Promise<void> {
  try {
    const domain = new URL(url).hostname;
    const { allowlist = {} } = await chrome.storage.sync.get('allowlist');
    const al = allowlist as Record<string, any>;
    if (!al[domain]) {
      al[domain] = { domain, addedAt: new Date().toISOString(), markSafeCount: 0, trusted: false };
    }
    al[domain].markSafeCount = (al[domain].markSafeCount || 0) + 1;
    if (al[domain].markSafeCount >= 3) al[domain].trusted = true;
    await chrome.storage.sync.set({ allowlist: al });
  } catch { /* non-critical */ }
}
