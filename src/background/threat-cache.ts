import type { LinkScanResult } from '../shared/types';
import { SCAN_CACHE_TTL_MS } from '../shared/constants';

const STORAGE_KEY = 'shieldai_url_scan_cache_v2';

type CacheMap = Record<string, { result: LinkScanResult; ts: number }>;

function storageArea(): chrome.storage.StorageArea {
  return chrome.storage.session ?? chrome.storage.local;
}

async function readMap(): Promise<CacheMap> {
  const data = await storageArea().get(STORAGE_KEY);
  return (data[STORAGE_KEY] as CacheMap | undefined) ?? {};
}

async function writeMap(map: CacheMap): Promise<void> {
  const keys = Object.keys(map);
  if (keys.length > 800) {
    const sorted = keys.sort((a, b) => map[b]!.ts - map[a]!.ts);
    for (const k of sorted.slice(400)) delete map[k];
  }
  await storageArea().set({ [STORAGE_KEY]: map });
}

export const THREAT_CACHE = {
  async get(url: string): Promise<LinkScanResult | null> {
    const map = await readMap();
    const row = map[url];
    if (!row) return null;
    if (Date.now() - row.ts > SCAN_CACHE_TTL_MS) {
      delete map[url];
      await writeMap(map);
      return null;
    }
    return row.result;
  },

  async set(url: string, result: LinkScanResult): Promise<void> {
    const map = await readMap();
    map[url] = { result, ts: Date.now() };
    await writeMap(map);
  },
};
