# ShieldAI — Social Attack Defence (Chrome Extension)

AI-assisted phishing and social-engineering detection in the browser: link scanning, NLP text analysis, Gmail/Outlook DOM helpers, optional VirusTotal / Google Safe Browsing, and periodic threat feeds.

## Prerequisites

- Node.js 18+ and npm
- Chrome (Chromium) for loading the unpacked extension

## Setup

```bash
cd shieldai-extension
npm install
npm run setup
```

`npm run setup` downloads feeds, CSVs, and ONNX assets into **`public/datasets`** and **`public/models`** (unzips Tranco where needed, POSTs URLhaus). Requires **Node 18+**.

## Development

```bash
npm run dev
```

Build once:

```bash
npm run build
```

Load the extension from `dist/` via **chrome://extensions** → **Load unpacked**.

## Tests

```bash
npm test
```

## Package for store upload

```bash
npm run package
```

Produces `shieldai-extension.zip` from `dist/`.

## Gmail add-on

Apps Script sources live in `src/gmail-addon/`. Deploy separately with [clasp](https://developers.google.com/apps-script/guides/clasp); the add-on manifest is independent of the Chrome extension.

## Notes

- Enter **VirusTotal** and **Google Safe Browsing** API keys in the popup **Settings** tab (disabled when **Privacy mode** is on).
- ONNX phishing inference uses a simple float encoding; if the bundled model’s input schema differs, the classifier falls back to heuristics without blocking the extension.
- **Aggressive** mode blocks navigation only when a link is already scored in the page cache (after scans complete).

## License

MIT (adjust as needed for your institution).
