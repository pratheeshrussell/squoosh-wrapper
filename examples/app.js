/**
 * Squoosh Library — Example Application
 *
 * Demonstrates how to use the squoosh-lib codecs in the browser:
 *   1. Decode an image using the native browser decoder
 *   2. Optionally resize using the WASM resize processor
 *   3. Encode to MozJPEG, WebP, AVIF, or PNG using WASM encoders
 */

// ─── Import codecs ───────────────────────────────────────────────────────
// Import only the codecs you need — each one lazy-loads its WASM on first use.
import { encode as mozjpegEncode, defaultOptions as mozjpegDefaults } from '../src/encoders/mozjpeg.js';
import { encode as webpEncode, defaultOptions as webpDefaults } from '../src/encoders/webp.js';
import { encode as avifEncode, defaultOptions as avifDefaults } from '../src/encoders/avif.js';
import { encode as pngEncode } from '../src/encoders/png.js';
import { decode as nativeDecode } from '../src/decoders/native.js';
import { resize } from '../src/processors/resize.js';

// ─── DOM References ──────────────────────────────────────────────────────
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const controls = document.getElementById('controls');
const formatSelect = document.getElementById('format');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const qualityRow = document.getElementById('qualityRow');
const resizeWidth = document.getElementById('resizeWidth');
const resizeHeight = document.getElementById('resizeHeight');
const compressBtn = document.getElementById('compressBtn');
const compressAllBtn = document.getElementById('compressAllBtn');
const statusEl = document.getElementById('status');
const previewSection = document.getElementById('previewSection');
const originalCanvas = document.getElementById('originalCanvas');
const originalSizeEl = document.getElementById('originalSize');
const outputPreview = document.getElementById('outputPreview');
const outputSizeEl = document.getElementById('outputSize');
const outputLabel = document.getElementById('outputLabel');
const resultsDiv = document.getElementById('results');
const resultsBody = document.getElementById('resultsBody');

// ─── State ───────────────────────────────────────────────────────────────
let currentImageData = null;
let currentFile = null;

// ─── Helpers ─────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function showStatus(msg, type = 'info') {
  statusEl.textContent = msg;
  statusEl.className = `status visible ${type}`;
}

function hideStatus() {
  statusEl.className = 'status';
}

function getMimeType(format) {
  const map = { mozjpeg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', png: 'image/png' };
  return map[format] || 'application/octet-stream';
}

function getExtension(format) {
  const map = { mozjpeg: 'jpg', webp: 'webp', avif: 'avif', png: 'png' };
  return map[format] || 'bin';
}

// ─── File Input ──────────────────────────────────────────────────────────
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) loadImage(e.target.files[0]);
});

// Drag & drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  if (e.dataTransfer.files.length) loadImage(e.dataTransfer.files[0]);
});

// ─── Load Image ──────────────────────────────────────────────────────────
async function loadImage(file) {
  currentFile = file;
  showStatus('Decoding image…', 'info');

  try {
    // Use the native browser decoder to get ImageData
    currentImageData = await nativeDecode(file);

    // Display original
    originalCanvas.width = currentImageData.width;
    originalCanvas.height = currentImageData.height;
    const ctx = originalCanvas.getContext('2d');
    ctx.putImageData(currentImageData, 0, 0);

    originalSizeEl.textContent = `${currentImageData.width}×${currentImageData.height} — ${formatBytes(file.size)}`;

    // Set resize placeholders
    resizeWidth.placeholder = currentImageData.width;
    resizeHeight.placeholder = currentImageData.height;

    // Show controls
    controls.classList.add('visible');
    previewSection.classList.add('visible');
    compressBtn.disabled = false;
    compressAllBtn.disabled = false;

    hideStatus();
    showStatus(`Loaded: ${file.name} (${currentImageData.width}×${currentImageData.height})`, 'success');
  } catch (err) {
    showStatus(`Error decoding image: ${err.message}`, 'error');
    console.error(err);
  }
}

// ─── Quality Slider ──────────────────────────────────────────────────────
qualitySlider.addEventListener('input', () => {
  qualityValue.textContent = qualitySlider.value;
});

formatSelect.addEventListener('change', () => {
  // PNG is lossless — hide quality slider
  qualityRow.style.display = formatSelect.value === 'png' ? 'none' : 'flex';
});

// ─── Compress ────────────────────────────────────────────────────────────
async function compressImage(format, quality) {
  let imageData = currentImageData;

  // Apply resize if specified
  const targetW = parseInt(resizeWidth.value);
  const targetH = parseInt(resizeHeight.value);
  if (targetW || targetH) {
    const w = targetW || Math.round(imageData.width * (targetH / imageData.height));
    const h = targetH || Math.round(imageData.height * (targetW / imageData.width));
    showStatus(`Resizing to ${w}×${h}…`, 'info');
    imageData = await resize(imageData, { width: w, height: h });
  }

  // Encode
  showStatus(`Encoding to ${format.toUpperCase()}…`, 'info');
  const start = performance.now();
  let buffer;

  switch (format) {
    case 'mozjpeg':
      buffer = await mozjpegEncode(imageData, { ...mozjpegDefaults, quality });
      break;
    case 'webp':
      buffer = await webpEncode(imageData, { ...webpDefaults, quality });
      break;
    case 'avif':
      buffer = await avifEncode(imageData, { ...avifDefaults, quality });
      break;
    case 'png':
      buffer = await pngEncode(imageData);
      break;
    default:
      throw new Error(`Unknown format: ${format}`);
  }

  const elapsed = performance.now() - start;
  return { buffer, elapsed, format };
}

// ─── Single Format Compress ──────────────────────────────────────────────
compressBtn.addEventListener('click', async () => {
  if (!currentImageData) return;

  const format = formatSelect.value;
  const quality = parseInt(qualitySlider.value);
  compressBtn.disabled = true;

  try {
    const { buffer, elapsed } = await compressImage(format, quality);

    // Preview
    const blob = new Blob([buffer], { type: getMimeType(format) });
    outputPreview.src = URL.createObjectURL(blob);
    outputLabel.textContent = format.toUpperCase();
    outputSizeEl.textContent = formatBytes(buffer.byteLength);

    // Results
    addResult(format, currentFile.size, buffer.byteLength, elapsed, buffer);

    showStatus(`Done! ${format.toUpperCase()} — ${formatBytes(buffer.byteLength)} in ${elapsed.toFixed(0)}ms`, 'success');
  } catch (err) {
    showStatus(`Error: ${err.message}`, 'error');
    console.error("Compression error:", err);
    alert(`Compression failed:\n\n${err.message}\n\nCheck the developer console for more details.`);
  } finally {
    compressBtn.disabled = false;
  }
});

// ─── All Formats Compress ────────────────────────────────────────────────
compressAllBtn.addEventListener('click', async () => {
  if (!currentImageData) return;

  const quality = parseInt(qualitySlider.value);
  compressAllBtn.disabled = true;
  compressBtn.disabled = true;
  resultsBody.innerHTML = '';

  const formats = ['mozjpeg', 'webp', 'avif', 'png'];

  for (const format of formats) {
    try {
      const { buffer, elapsed } = await compressImage(format, quality);
      addResult(format, currentFile.size, buffer.byteLength, elapsed, buffer);

      // Show last result as preview
      const blob = new Blob([buffer], { type: getMimeType(format) });
      outputPreview.src = URL.createObjectURL(blob);
      outputLabel.textContent = format.toUpperCase();
      outputSizeEl.textContent = formatBytes(buffer.byteLength);
    } catch (err) {
      addResultError(format, err.message);
    }
  }

  showStatus('All formats compressed!', 'success');
  compressAllBtn.disabled = false;
  compressBtn.disabled = false;
});

// ─── Results Table ───────────────────────────────────────────────────────
function addResult(format, originalSize, compressedSize, elapsed, buffer) {
  resultsDiv.classList.add('visible');

  const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
  const isPositive = compressedSize < originalSize;

  // Create download link
  const blob = new Blob([buffer], { type: getMimeType(format) });
  const url = URL.createObjectURL(blob);
  const baseName = currentFile.name.replace(/\.[^.]+$/, '');

  const row = document.createElement('tr');
  row.innerHTML = `
    <td><strong>${format.toUpperCase()}</strong></td>
    <td>${formatBytes(originalSize)}</td>
    <td>${formatBytes(compressedSize)}</td>
    <td class="savings ${isPositive ? 'positive' : 'negative'}">${isPositive ? '-' : '+'}${Math.abs(savings)}%</td>
    <td>${elapsed.toFixed(0)}ms</td>
    <td><a href="${url}" download="${baseName}.${getExtension(format)}" class="download-link">Download</a></td>
  `;
  resultsBody.appendChild(row);
}

function addResultError(format, errorMsg) {
  resultsDiv.classList.add('visible');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><strong>${format.toUpperCase()}</strong></td>
    <td colspan="4" style="color: var(--danger);">Error: ${errorMsg}</td>
    <td></td>
  `;
  resultsBody.appendChild(row);
}
