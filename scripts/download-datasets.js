/**
 * npm run setup — downloads datasets & models into public/ (bundled with the extension).
 * Requires Node.js 18+ and: npm i (includes unzipper devDependency).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import unzipper from 'unzipper';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATASETS_DIR = path.join(ROOT, 'public', 'datasets');
const MODELS_DIR = path.join(ROOT, 'public', 'models');

fs.mkdirSync(DATASETS_DIR, { recursive: true });
fs.mkdirSync(MODELS_DIR, { recursive: true });

const downloads = [
  {
    name: 'PhishTank verified phishing URLs',
    url: 'https://data.phishtank.com/data/online-valid.json',
    dest: path.join(DATASETS_DIR, 'phishing-urls.json'),
  },
  {
    name: 'OpenPhish community feed',
    url: 'https://openphish.com/feed.txt',
    dest: path.join(DATASETS_DIR, 'openphish-feed.txt'),
  },
  {
    name: 'URLhaus recent malicious URLs (JSON)',
    url: 'https://urlhaus-api.abuse.ch/v1/urls/recent/limit/1000/',
    dest: path.join(DATASETS_DIR, 'urlhaus-recent.json'),
    method: 'POST',
    body: '',
  },
  {
    name: 'Mitchell Krogza phishing links (today)',
    url: 'https://raw.githubusercontent.com/mitchellkrogza/Phishing.Database/master/phishing-links-NEW-today.txt',
    dest: path.join(DATASETS_DIR, 'phishing-new-today.txt'),
  },
  {
    name: 'Tranco Top 1M domains (legitimate allowlist)',
    url: 'https://tranco-list.eu/top-1m.csv.zip',
    dest: path.join(DATASETS_DIR, 'top-1m-domains.csv'),
    unzip: true,
    zipEntry: 'top-1m.csv',
  },
  {
    name: 'Disposable email domain blocklist',
    url: 'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf',
    dest: path.join(DATASETS_DIR, 'disposable-email-domains.txt'),
  },
  {
    name: 'Homograph Unicode lookalike map',
    url: 'https://raw.githubusercontent.com/nicowillis/homograph-attack-list/main/homographs.json',
    dest: path.join(DATASETS_DIR, 'homograph-attacks.json'),
  },
  {
    name: 'ESET social engineering phrases',
    url: 'https://raw.githubusercontent.com/eset/malware-ioc/master/social_engineering/phrases.txt',
    dest: path.join(DATASETS_DIR, 'social-engineering-phrases.txt'),
  },
  {
    name: 'Enron spam/ham email dataset (CSV)',
    url: 'https://raw.githubusercontent.com/MWiechmann/enron_spam_data/main/enron_spam_data.csv',
    dest: path.join(DATASETS_DIR, 'spam-emails.csv'),
  },
  {
    name: 'ONNX phishing URL classifier (pirocheto)',
    url: 'https://huggingface.co/pirocheto/phishing-url-detection/resolve/main/model.onnx',
    dest: path.join(MODELS_DIR, 'phishing-url-model.onnx'),
  },
  {
    name: 'DistilBERT tokenizer (Xenova)',
    url: 'https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main/tokenizer.json',
    dest: path.join(MODELS_DIR, 'tokenizer.json'),
  },
  {
    name: 'DistilBERT tokenizer config',
    url: 'https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main/tokenizer_config.json',
    dest: path.join(MODELS_DIR, 'tokenizer_config.json'),
  },
  {
    name: 'DistilBERT special tokens map',
    url: 'https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main/special_tokens_map.json',
    dest: path.join(MODELS_DIR, 'special_tokens_map.json'),
  },
  {
    name: 'DistilBERT vocab.txt',
    url: 'https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main/vocab.txt',
    dest: path.join(MODELS_DIR, 'vocab.txt'),
  },
  {
    name: 'DistilBERT quantized ONNX model',
    url: 'https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main/onnx/model_quantized.onnx',
    dest: path.join(MODELS_DIR, 'sentiment-model.onnx'),
  },
];

async function fetchBuffer(url, options = {}, redirects = 0) {
  if (redirects > 8) throw new Error('Too many redirects');
  const res = await fetch(url, {
    redirect: 'manual',
    headers: { 'User-Agent': 'ShieldAI-setup/1.0' },
    ...options,
  });
  if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
    const next = new URL(res.headers.get('location'), url).href;
    return fetchBuffer(next, options, redirects + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function downloadOnce(item) {
  const init = {};
  if (item.method === 'POST') {
    init.method = 'POST';
    init.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    init.body = item.body ?? '';
  }
  const buf = await fetchBuffer(item.url, init);
  if (item.expectedSha256) {
    const hash = crypto.createHash('sha256').update(buf).digest('hex');
    if (hash !== item.expectedSha256) {
      throw new Error(`Checksum mismatch for ${item.name}`);
    }
  }
  if (item.unzip) {
    const directory = await unzipper.Open.buffer(buf);
    const entry = directory.files.find(
      (f) =>
        f.path === item.zipEntry ||
        f.path.endsWith('/' + item.zipEntry) ||
        f.path.endsWith(item.zipEntry),
    );
    if (!entry) throw new Error(`Zip entry not found: ${item.zipEntry}`);
    const stream = entry.stream();
    await pipeline(stream, createWriteStream(item.dest));
  } else {
    fs.mkdirSync(path.dirname(item.dest), { recursive: true });
    fs.writeFileSync(item.dest, buf);
  }
}

async function downloadWithRetry(item, attempts) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      await downloadOnce(item);
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}

async function downloadAll() {
  for (const item of downloads) {
    if (fs.existsSync(item.dest)) {
      console.log(`✓ Already exists: ${path.relative(ROOT, item.dest)}`);
      continue;
    }
    process.stdout.write(`⬇ Downloading: ${item.name}… `);
    try {
      await downloadWithRetry(item, 3);
      const stat = fs.statSync(item.dest);
      console.log(`✓ Saved (${stat.size} bytes)`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }
  console.log('\n✅ Dataset / model download pass complete.\n');
}

downloadAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
