// storage.ts

import type { ExtensionSettings } from './types';

const DEFAULT_SETTINGS: ExtensionSettings = {
  protectionMode: 'standard',
  enableMLScanning: true,
  enableVirusTotal: false,
  virusTotalApiKey: '',
  enableGoogleSafeBrowsing: false,
  safeBrowsingApiKey: '',
  showLinkTooltips: true,
  highlightSuspiciousLinks: true,
  scanGmail: true,
  scanOutlook: true,
  autoExpandShortUrls: true,
  threatThreshold: 60,
  enableQRScanning: true,
  enableOCRScanning: true,
  enableClipboardMonitor: true,
  enablePasswordGuard: true,
  enableHistoryScan: false,
  enableNotifications: true,
  allowlistDomains: [],
  blocklistDomains: [],
  privacyMode: false,
  trustedDomains: [],
  dailyDigest: true,
  autoAllowlistThreshold: 3,
};

export async function getSettings(): Promise<ExtensionSettings> {
  try {
    const { settings } = await chrome.storage.sync.get('settings');
    return { ...DEFAULT_SETTINGS, ...(settings || {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: Partial<ExtensionSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({ settings: { ...current, ...s } });
}
