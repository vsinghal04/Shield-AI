// mv3-blocker.ts — MV3-safe URL blocking via declarativeNetRequest
import { scanUrl } from './scan-orchestrator';

export async function updateDynamicBlockRules(dangerousUrls: string[]): Promise<void> {
  // Only block if user has explicitly enabled aggressive mode
  // Never auto-block major domains
  const { getSettings } = await import('../shared/storage');
  const settings = await getSettings();
  if (settings?.protectionMode !== 'aggressive') return;

  const NEVER_BLOCK = [
    'google.com', 'bing.com', 'microsoft.com', 'apple.com',
    'amazon.com', 'facebook.com', 'youtube.com', 'twitter.com',
    'x.com', 'instagram.com', 'linkedin.com', 'github.com',
    'wikipedia.org', 'reddit.com', 'yahoo.com',
  ];

  const safeToBlock = dangerousUrls.filter(url => {
    try {
      const hostname = new URL(url).hostname;
      const root = hostname.split('.').slice(-2).join('.');
      return !NEVER_BLOCK.includes(root);
    } catch { return false; }
  });

  if (safeToBlock.length === 0) return;

  try {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const removeIds = existing.map(r => r.id);

    const addRules: chrome.declarativeNetRequest.Rule[] = safeToBlock
      .slice(0, 4900)
      .map((url, i) => {
        try {
          const hostname = new URL(url).hostname;
          return {
            id: i + 1,
            priority: 1,
            action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
            condition: {
              urlFilter: `||${hostname}^`,
              resourceTypes: [
                chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
                chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
              ]
            }
          };
        } catch { return null; }
      })
      .filter(Boolean) as chrome.declarativeNetRequest.Rule[];

    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: removeIds, addRules });
  } catch (e) {
    console.warn('[ShieldAI] DNR update failed:', e);
  }
}

export async function injectInterstitialIfDangerous(url: string): Promise<void> {
  try {
    
    const result = await scanUrl(url);
    if (result.threatScore >= 70) {
      const warnUrl = chrome.runtime.getURL(`warning.html?url=${encodeURIComponent(url)}&score=${result.threatScore}`);
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) chrome.tabs.update(tabs[0].id, { url: warnUrl });
    }
  } catch { /* non-critical */ }
}
