// threat-feed.ts — fetches phishing URL feeds, stores in chrome.storage.local

const FEED_URLS = [
  'https://openphish.com/feed.txt',
  'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-links-NEW-today.txt',
];

export async function refreshThreatFeeds(): Promise<void> {
  const hosts = new Set<string>();
  const urls  = new Set<string>();

  for (const feedUrl of FEED_URLS) {
    try {
      const res = await fetch(feedUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const text = await res.text();
      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('http')) continue;
        try {
          urls.add(trimmed);
          hosts.add(new URL(trimmed).hostname);
        } catch { /* skip malformed */ }
      }
    } catch { /* skip failed feed */ }
  }

  // Also load bundled dataset
  try {
    const res = await fetch(chrome.runtime.getURL('datasets/phishing-urls.json'));
    if (res.ok) {
      const data = await res.json();
      const entries = Array.isArray(data) ? data : (data.urls || []);
      for (const entry of entries) {
        const u = entry?.url || entry;
        if (typeof u !== 'string') continue;
        try { urls.add(u); hosts.add(new URL(u).hostname); } catch { /* skip */ }
      }
    }
  } catch { /* skip */ }

  await chrome.storage.local.set({
    threatHosts: [...hosts],
    threatUrls:  [...urls],
    feedsUpdatedAt: Date.now(),
  });

  console.log(`[ShieldAI] Feeds refreshed: ${hosts.size} hosts, ${urls.size} URLs`);
}

export async function checkFeedlists(url: string): Promise<boolean> {
  try {
    const { threatHosts = [], threatUrls = [] } = await chrome.storage.local.get(['threatHosts', 'threatUrls']);
    const hostname = new URL(url).hostname;
    if ((threatUrls as string[]).includes(url)) return true;
    if ((threatHosts as string[]).includes(hostname)) return true;
  } catch { /* malformed url */ }
  return false;
}
