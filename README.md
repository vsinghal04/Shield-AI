<p align="center">
  <img src="docs/banner.png" alt="ShieldAI Banner" width="100%">
</p>
<p align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

![Machine Learning](https://img.shields.io/badge/Machine-Learning-orange?style=for-the-badge)

![ONNX](https://img.shields.io/badge/ONNX-Runtime-005CED?style=for-the-badge)

![OCR](https://img.shields.io/badge/OCR-Tesseract-green?style=for-the-badge)

![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</p>
# 🛡️ ShieldAI

### AI-Powered Social Engineering Defense System

## 📖 Overview

Modern phishing attacks are no longer limited to suspicious links or poorly written emails. Attackers now use Generative AI to create highly convincing messages, fake login pages, and image-based scams that closely resemble legitimate communication.

**ShieldAI** is an AI-powered browser extension designed to defend users against these evolving threats. It combines machine learning, OCR, URL intelligence, and rule-based threat detection to analyze suspicious content in real time and provide an immediate risk assessment before users interact with potentially malicious websites, emails, or messages.

Unlike traditional phishing detection tools that rely mainly on blacklists or keyword matching, ShieldAI performs multi-layer analysis by combining:

- 🧠 AI-based text classification
- 🌐 URL reputation and pattern analysis
- 🖼️ OCR for image-based scam detection
- 📧 Gmail email scanning
- ⚠️ Risk score generation
- 🛡️ Rule-based cybersecurity checks

This hybrid approach enables the extension to detect modern social engineering attacks more accurately while remaining lightweight, privacy-conscious, and compatible with Chromium-based browsers.
---

## Key Features

- AI-powered scam message detection
- Suspicious URL analysis
- OCR-based image scanning
- Gmail protection
- Real-time webpage monitoring
- Risk score generation
- Warning popups
- Cross-browser support (Chromium-based browsers)

---

## Tech Stack

- JavaScript
- HTML & CSS
- Vite
- Chrome Extension API
- ONNX Runtime
- OCR
- Tailwind CSS
- Playwright

---

## Workflow- Detection Pipeline

```mermaid
flowchart LR

A[🌍 Browser Content]
B[📧 Gmail Email]
C[🔗 URL]
D[🖼️ Image OCR]

A --> E
B --> E
C --> E
D --> E

E[🔍 ShieldAI Analysis Engine]

E --> F[🧠 AI Text Analysis]
E --> G[🌐 URL Analysis]
E --> H[🛡️ Rule Engine]
E --> I[📖 OCR Processing]

F --> J
G --> J
H --> J
I --> J

J[⚠️ Risk Score Engine]

J --> K{Threat Detected?}

K -->|Yes| L[🚨 Warning Popup]

K -->|No| M[✅ Safe Content]
```
---

## Project Structure

```text
src/
│
├── analyzers/
├── background/
├── content/
├── gmail-addon/
├── ml/
├── popup/
├── options/
└── shared/

public/
│
├── datasets/
├── models/
├── rules/
└── icons/
```

---

## License

MIT License
