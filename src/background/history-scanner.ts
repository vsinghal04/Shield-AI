// history-scanner.ts
import { checkFeedlists } from './threat-feed';

export async function scanBrowserHistory(): Promise<any> {
  try {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const items = await chrome.history.search({ text: '', startTime: thirtyDaysAgo, maxResults: 5000 });
    const urls = [...new Set(items.map(i => i.url).filter(Boolean))] as string[];
    
    const threats = [];
    for (const url of urls) {
      if (await checkFeedlists(url)) {
        const item = items.find(i => i.url === url);
        threats.push({ url, visitCount: item?.visitCount || 1, lastVisit: new Date(item?.lastVisitTime || 0).toISOString() });
      }
    }
    return { scannedCount: urls.length, threatsFound: threats.length, threats };
  } catch (e) {
    return { error: String(e), scannedCount: 0, threatsFound: 0, threats: [] };
  }
}
