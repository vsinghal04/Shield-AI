// Remove unused imports since they have been refactored
import type { EmailScanMerged, LinkScanResult } from '../shared/types';

export class GmailScanner {
  private observer: MutationObserver;

  constructor() {
    this.observer = new MutationObserver(() => {
      void this.onDomChange();
    });
  }

  start(): void {
    this.observer.observe(document.body, { childList: true, subtree: true });
    console.log('[ShieldAI] Gmail scanner started');
  }

  private async onDomChange(): Promise<void> {
    const emailBody =
      (document.querySelector('[data-message-id] .a3s.aiL') as HTMLElement | null) ??
      (document.querySelector('.a3s.aiL') as HTMLElement | null);
    if (!emailBody || emailBody.dataset.shieldaiScanned === '1') return;
    emailBody.dataset.shieldaiScanned = '1';
    await this.scanEmail(emailBody);
  }

  private async scanEmail(emailBody: HTMLElement): Promise<void> {
    const links = Array.from(emailBody.querySelectorAll<HTMLAnchorElement>('a[href]')).map((a) => a.href);
    const text = emailBody.innerText;
    const from =
      document.querySelector('[email]')?.getAttribute('email') ??
      document.querySelector('.gD[email]')?.getAttribute('email') ??
      '';
    const subject = document.querySelector('h2.hP')?.textContent ?? '';

    const emailScan = (await chrome.runtime.sendMessage({
      type: 'SCAN_EMAIL',
      from,
      subject,
      body: text,
      headers: {},
      links,
    })) as EmailScanMerged;

    // Trigger page-wide scanners asynchronously as they no longer return results directly
    import('../analyzers/ocr-scanner').then(m => m.scanAllImagesOnPage()).catch(() => {});
    import('../analyzers/qr-code-scanner').then(m => m.scanPageForQRCodes(emailBody)).catch(() => {});

    await chrome.runtime.sendMessage({
      type: 'UPDATE_SENDER_REPUTATION',
      email: from,
      scanResult: {
        threatScore: emailScan.threatScore,
        tactics: emailScan.tactics,
      },
    });

    const finalScore = emailScan.threatScore;
    this.injectThreatBadge(finalScore, emailScan.tactics ?? [], [], []);
    await this.annotateLinks(emailBody, emailScan.linkResults ?? []);
  }

  private injectThreatBadge(
    score: number,
    tactics: string[],
    ocrThreats: Array<{ threats: string[] }>,
    qrThreats: unknown[],
  ): void {
    document.getElementById('shieldai-gmail-badge')?.remove();

    const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
    const label = score >= 70 ? 'DANGER' : score >= 40 ? 'SUSPICIOUS' : 'SAFE';

    const badge = document.createElement('div');
    badge.id = 'shieldai-gmail-badge';
    badge.style.cssText = `
      display:flex;align-items:center;gap:8px;padding:6px 12px;
      background:#1e293b;border:1px solid ${color};border-radius:6px;
      font-family:ui-monospace,monospace;font-size:12px;color:${color};
      margin:8px 0;cursor:pointer;flex-wrap:wrap;
    `;
    badge.innerHTML = `
      🛡️ ShieldAI: <strong>${label}</strong> (${score}/100)
      ${tactics
        .slice(0, 2)
        .map(
          (t) =>
            `<span style="background:${color}22;padding:2px 6px;border-radius:3px;margin-left:4px;">${t}</span>`,
        )
        .join('')}
      ${ocrThreats.length > 0 ? `<span style="color:#f59e0b;margin-left:6px">⚠ Image text flagged</span>` : ''}
      ${qrThreats.length > 0 ? `<span style="color:#ef4444;margin-left:6px">⚠ QR phishing detected</span>` : ''}
    `;
    badge.addEventListener('click', () => {
      void chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
    });

    const emailContainer = document.querySelector('.adn.ads') ?? document.querySelector('.nH.if');
    emailContainer?.insertBefore(badge, emailContainer.firstChild);
  }

  private async annotateLinks(emailBody: HTMLElement, linkResults: LinkScanResult[]): Promise<void> {
    const anchors = emailBody.querySelectorAll<HTMLAnchorElement>('a[href]');
    anchors.forEach((anchor) => {
      const result = linkResults.find((r) => r.url === anchor.href || r.finalDestination === anchor.href);
      if (!result) return;
      const dot = document.createElement('span');
      dot.style.cssText = `
        display:inline-block;width:8px;height:8px;border-radius:50%;
        margin-left:3px;vertical-align:middle;
        background:${result.threatScore >= 70 ? '#ef4444' : result.threatScore >= 40 ? '#f59e0b' : '#22c55e'};
      `;
      dot.title = `ShieldAI: ${result.threatScore}/100 — ${result.reasons?.map((r) => r.label).join(', ') || 'OK'}`;
      anchor.appendChild(dot);
    });
  }
}
