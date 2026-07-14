import * as ort from 'onnxruntime-web';
console.log('ORT loaded', !!ort);

import { pipeline } from '@xenova/transformers';
console.log('Pipeline loaded', !!pipeline);

import * as Tesseract from 'tesseract.js';
console.log('Tesseract loaded', !!Tesseract);
