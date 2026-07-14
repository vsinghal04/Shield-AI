// phishing-url-classifier.ts
// Model: pirocheto/phishing-url-detection
// Input:  float32[1,75] named "input"
// Output: float32[1,2]  named "probabilities" — index 1 = P(phishing)
import * as ort from 'onnxruntime-web';

let session: any = null;

export async function loadPhishingModel(): Promise<void> {
  if (session) return;
  try {
    
    const modelUrl = chrome.runtime.getURL('models/phishing-url-model.onnx');
    session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
  } catch (e) {
    console.warn('[ShieldAI] Failed to load phishing model:', e);
    session = null;
  }
}

export async function classifyUrl(url: string): Promise<number> {
  if (!session) {
    try { await loadPhishingModel(); } catch { return 0; }
  }
  if (!session) return 0;

  try {
    
    const features = extractUrlFeatures(url);
    const tensor = new ort.Tensor('float32', features, [1, 75]);
    const results = await session.run({ input: tensor });
    const probs = results['probabilities']?.data as Float32Array;
    if (!probs || probs.length < 2) return 0;
    return probs[1]; // P(phishing)
  } catch (e) {
    console.warn('[ShieldAI] Inference failed:', e);
    return 0;
  }
}

function extractUrlFeatures(url: string): Float32Array {
  const f = new Float32Array(75).fill(0);
  try {
    const parsed   = new URL(url);
    const hostname = parsed.hostname || '';
    const path_    = parsed.pathname || '';
    const full     = url || '';
    const parts    = hostname.split('.');

    f[0]  = Math.min(full.length / 200, 1);
    f[1]  = Math.min(hostname.length / 100, 1);
    f[2]  = Math.min(path_.length / 200, 1);
    f[3]  = Math.min((parsed.search || '').length / 200, 1);
    f[4]  = Math.min((parsed.hash   || '').length / 100, 1);
    f[5]  = (full.match(/\./g)  || []).length / 10;
    f[6]  = (full.match(/\//g)  || []).length / 20;
    f[7]  = (full.match(/\?/g)  || []).length / 5;
    f[8]  = (full.match(/=/g)   || []).length / 10;
    f[9]  = (full.match(/@/g)   || []).length / 3;
    f[10] = (full.match(/-/g)   || []).length / 10;
    f[11] = (full.match(/_/g)   || []).length / 10;
    f[12] = (full.match(/~/g)   || []).length / 5;
    f[13] = (full.match(/&/g)   || []).length / 10;
    f[14] = (full.match(/%/g)   || []).length / 10;
    f[15] = (full.match(/!/g)   || []).length / 5;
    f[16] = (full.match(/\*/g)  || []).length / 5;
    f[17] = (full.match(/,/g)   || []).length / 5;
    f[18] = (full.match(/;/g)   || []).length / 5;
    f[19] = (full.match(/\$/g)  || []).length / 5;
    f[20] = Math.min(parts.length / 5, 1);
    f[21] = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ? 1 : 0;
    f[22] = parsed.protocol === 'https:' ? 1 : 0;
    f[23] = parsed.port ? 1 : 0;
    f[24] = /\.(xyz|top|click|loan|work|gq|ml|cf|tk|ga)$/.test(hostname) ? 1 : 0;
    f[25] = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly'].includes(hostname) ? 1 : 0;
    f[26] = Math.min(shannonEntropy(hostname) / 5, 1);
    const brands = ['paypal','google','apple','microsoft','amazon','facebook','netflix','bank'];
    const root = parts.slice(-2).join('.');
    f[27] = brands.some(b => hostname.includes(b) && !root.includes(b)) ? 1 : 0;
    f[28] = (full.match(/%[0-9a-fA-F]{2}/g) || []).length > 3 ? 1 : 0;
    f[29] = path_.includes('//') ? 1 : 0;
    f[30] = hostname.length > 0 ? Math.min((hostname.match(/\d/g) || []).length / hostname.length, 1) : 0;
    f[31] = full.length > 0 ? Math.min((full.match(/[A-Z]/g) || []).length / full.length, 1) : 0;
    const kws = ['login','secure','account','update','verify','confirm','banking','password','credential','suspend','unusual','invoice','paypal','ebay','amazon','apple','google','microsoft','netflix','wellsfargo','chase','irs','refund','prize','winner','free','click','urgent','limited','offer'];
    kws.forEach((k, i) => { if (i + 32 < 75) f[32 + i] = full.toLowerCase().includes(k) ? 1 : 0; });
    f[72] = shannonEntropy(path_) / 5;
    f[73] = [...(parsed.searchParams || [])].length > 5 ? 1 : 0;
    f[74] = /\.(exe|zip|rar|js|vbs|ps1|bat|cmd|scr)$/.test(path_) ? 1 : 0;
  } catch { /* return zeros on any error */ }
  return f;
}

function shannonEntropy(s: string): number {
  if (!s || s.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  return Object.values(freq).reduce((h, count) => {
    const p = count / s.length;
    return h - p * Math.log2(p);
  }, 0);
}
