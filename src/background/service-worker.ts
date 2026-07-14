/// <reference types="chrome"/>

import { refreshThreatFeeds } from './threat-feed';
import { scanUrl } from './scan-orchestrator';
import { analyzeText } from '../analyzers/text-threat-classifier';
import { scanEmail } from './email-merge';
import { getSettings, saveSettings } from '../shared/storage';
import { getThreatLog } from './db';
import { scanBrowserHistory } from './history-scanner';
import { generateThreatReport } from './report-generator';
import { updateSenderReputation } from './sender-reputation';
import { recordMarkSafe } from './allowlist-manager';
import { injectInterstitialIfDangerous } from './mv3-blocker';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('refresh-feeds', { periodInMinutes: 360 });
  refreshThreatFeeds().catch(console.error);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh-feeds') {
    refreshThreatFeeds().catch(console.error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  dispatch(message, sender)
    .then(sendResponse)
    .catch((err) => sendResponse({ error: String(err) }));
  return true; // keeps the message channel open for async response
});

async function dispatch(message: any, _sender: any): Promise<any> {
  const type: string = message?.type ?? '';

  if (type === 'SCAN_URL') {
    return scanUrl(message.url);
  }
  if (type === 'SCAN_TEXT') {
    return analyzeText(message.text);
  }
  if (type === 'SCAN_EMAIL') {
    return scanEmail(message);
  }
  if (type === 'GET_SETTINGS') {
    return getSettings();
  }
  if (type === 'SAVE_SETTINGS') {
    await saveSettings(message.settings);
    return { ok: true };
  }
  if (type === 'REFRESH_FEEDS') {
    return refreshThreatFeeds();
  }
  if (type === 'GET_THREAT_LOG') {
    return getThreatLog(message.filter);
  }
  if (type === 'SCAN_HISTORY') {
    return scanBrowserHistory();
  }
  if (type === 'GENERATE_REPORT') {
    return generateThreatReport(message.dateRange);
  }
  if (type === 'UPDATE_SENDER_REPUTATION') {
    return updateSenderReputation(message.email, message.scanResult);
  }
  if (type === 'MARK_SAFE') {
    return recordMarkSafe(message.url);
  }
  if (type === 'OPEN_POPUP') {
    if (chrome.action?.openPopup) chrome.action.openPopup();
    return { ok: true };
  }
  if (type === 'INTERSTITIAL_CHECK') {
    return injectInterstitialIfDangerous(message.url);
  }

  return { error: 'Unknown message type: ' + type };
}
