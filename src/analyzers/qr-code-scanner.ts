// qr-code-scanner.ts — CONTENT SCRIPT ONLY
import jsQR from 'jsqr';

export async function scanPageForQRCodes(root: Element = document.body): Promise<void> {
  const images = Array.from(root.querySelectorAll('img')).slice(0, 20);

  for (const img of images) {
    try {
      
      const canvas = document.createElement('canvas');
      const w = (img as HTMLImageElement).naturalWidth  || 200;
      const h = (img as HTMLImageElement).naturalHeight || 200;
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img as HTMLImageElement, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, w, h);

      if (code?.data?.startsWith('http')) {
        const result = await chrome.runtime.sendMessage({ type: 'SCAN_URL', url: code.data });
        if (result?.threatScore > 40) {
          const badge = document.createElement('div');
          badge.style.cssText = `position:absolute;top:0;left:0;background:rgba(239,68,68,0.92);color:#fff;font-size:10px;padding:3px 6px;border-radius:4px;z-index:9999;font-family:monospace;`;
          badge.textContent = `⚠ QR phishing detected (${result.threatScore}/100)`;
          const wrapper = document.createElement('div');
          wrapper.style.cssText = 'position:relative;display:inline-block;';
          img.parentNode?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          wrapper.appendChild(badge);
        }
      }
    } catch { /* skip */ }
  }
}
