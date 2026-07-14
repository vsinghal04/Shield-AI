// ocr-scanner.ts — CONTENT SCRIPT ONLY, never import from background files
import * as Tesseract from 'tesseract.js';

export async function extractTextFromImage(img: HTMLImageElement): Promise<string> {
  try {
    
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth  || 200;
    canvas.height = img.naturalHeight || 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(img, 0, 0);
    const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png'));
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await worker.recognize(blob);
    await worker.terminate();
    return text.trim();
  } catch { return ''; }
}

export async function scanAllImagesOnPage(): Promise<void> {
  const images = Array.from(document.querySelectorAll('img'))
    .filter(img => img.naturalWidth > 50 && img.naturalHeight > 20)
    .slice(0, 8);

  for (const img of images) {
    try {
      const text = await extractTextFromImage(img as HTMLImageElement);
      if (text.length < 15) continue;
      const result = await chrome.runtime.sendMessage({ type: 'SCAN_TEXT', text });
      if (result?.overallScore > 40) {
        const badge = document.createElement('div');
        badge.style.cssText = 'position:absolute;top:0;left:0;background:rgba(239,68,68,0.9);color:white;font-size:10px;padding:2px 6px;border-radius:3px;z-index:9999;font-family:monospace;';
        badge.textContent = `⚠ ShieldAI: Suspicious text in image (${result.overallScore}/100)`;
        img.style.position = 'relative';
        img.parentElement?.style && (img.parentElement.style.position = 'relative');
        img.parentElement?.appendChild(badge);
      }
    } catch { /* skip */ }
  }
}
