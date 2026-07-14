// link-reputation.ts — VirusTotal v3 + Google Safe Browsing
import { getSettings } from '../shared/storage';

export async function checkVirusTotal(url: string): Promise<any> {
  try {
    
    const settings = await getSettings();
    if (!settings?.enableVirusTotal || !settings?.virusTotalApiKey) return null;

    const apiKey = settings.virusTotalApiKey;
    const urlId = btoa(url).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const res = await fetch(`https://www.virustotal.com/api/v3/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey }
    });

    if (res.status === 404) {
      // Submit URL for analysis
      const form = new FormData();
      form.append('url', url);
      const submitRes = await fetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST', headers: { 'x-apikey': apiKey }, body: form
      });
      if (!submitRes.ok) return null;
      return { positives: 0, total: 0, pending: true };
    }

    if (!res.ok) return null;
    const data = await res.json();
    const stats = data?.data?.attributes?.last_analysis_stats || {};
    return {
      positives: (stats.malicious || 0) + (stats.suspicious || 0),
      total: Object.values(stats).reduce((a: any, b: any) => a + b, 0),
    };
  } catch { return null; }
}
