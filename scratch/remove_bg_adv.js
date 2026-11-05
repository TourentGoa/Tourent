const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { decodePNG, encodePNG } = require('./png_helper');

function removeStudioBackgroundAdvanced(inputPath, outputPath, options = {}) {
  const buf = fs.readFileSync(inputPath);
  const { width, height, data } = decodePNG(buf);

  function getLum(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function isBackgroundCandidate(r, g, b, prevR, prevG, prevB) {
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const sat = maxVal - minVal;
    const lum = getLum(r, g, b);

    // Car bodies are saturated
    if (sat > 25) return false;

    // Interior / dark parts
    if (lum < 110 && maxVal < 120) return false;

    if (prevR !== undefined) {
      const diff = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
      if (diff > 45) return false;
    }

    return (sat <= 25 && lum >= 110) || (minVal >= 235);
  }

  // Push border pixels
  for (let x = 0; x < width; x++) {
    const idxTop = x;
    const idxBottom = (height - 1) * width + x;

    const rT = data[idxTop * 4], gT = data[idxTop * 4 + 1], bT = data[idxTop * 4 + 2];
    if (isBackgroundCandidate(rT, gT, bT)) {
      visited[idxTop] = 1; isBg[idxTop] = 1; queue[qTail++] = idxTop;
    }

    const rB = data[idxBottom * 4], gB = data[idxBottom * 4 + 1], bB = data[idxBottom * 4 + 2];
    if (isBackgroundCandidate(rB, gB, bB)) {
      visited[idxBottom] = 1; isBg[idxBottom] = 1; queue[qTail++] = idxBottom;
    }
  }

  for (let y = 0; y < height; y++) {
    const idxLeft = y * width;
    const idxRight = y * width + (width - 1);

    const rL = data[idxLeft * 4], gL = data[idxLeft * 4 + 1], bL = data[idxLeft * 4 + 2];
    if (!visited[idxLeft] && isBackgroundCandidate(rL, gL, bL)) {
      visited[idxLeft] = 1; isBg[idxLeft] = 1; queue[qTail++] = idxLeft;
    }

    const rR = data[idxRight * 4], gR = data[idxRight * 4 + 1], bR = data[idxRight * 4 + 2];
    if (!visited[idxRight] && isBackgroundCandidate(rR, gR, bR)) {
      visited[idxRight] = 1; isBg[idxRight] = 1; queue[qTail++] = idxRight;
    }
  }

  // BFS
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);
    const cr = data[curr * 4], cg = data[curr * 4 + 1], cb = data[curr * 4 + 2];

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (let i = 0; i < 4; i++) {
      const nIdx = neighbors[i];
      if (nIdx >= 0 && !visited[nIdx]) {
        const nr = data[nIdx * 4], ng = data[nIdx * 4 + 1], nb = data[nIdx * 4 + 2];

        if (isBackgroundCandidate(nr, ng, nb, cr, cg, cb)) {
          visited[nIdx] = 1;
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  // Find lowest tire point to clean floor cast shadows
  const outData = Buffer.from(data);

  for (let idx = 0; idx < width * height; idx++) {
    if (isBg[idx]) {
      outData[idx * 4 + 3] = 0;
    }
  }

  // Clean bottom floor shadow
  const bottomThresholdY = height * 0.82;
  for (let y = Math.floor(bottomThresholdY); y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const dIdx = idx * 4;
      if (!isBg[idx]) {
        const r = data[dIdx], g = data[dIdx + 1], b = data[dIdx + 2];
        const sat = Math.max(r, g, b) - Math.min(r, g, b);
        const lum = getLum(r, g, b);

        // Ground shadow on studio floor (low saturation, dark to grey)
        if (sat < 15 && lum < 80 && y > height * 0.84) {
          // Soften/fade the ground shadow cleanly
          const fade = Math.max(0, 1 - (y - bottomThresholdY) / (height - bottomThresholdY));
          if (fade < 0.25) {
            outData[dIdx + 3] = 0;
          } else {
            outData[dIdx + 3] = Math.floor(fade * 160);
          }
        }
      }
    }
  }

  // Smooth feathering on boundary
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const dIdx = idx * 4;
      if (outData[dIdx + 3] > 0) {
        let bgCount = 0;
        if (outData[(idx - 1) * 4 + 3] === 0) bgCount++;
        if (outData[(idx + 1) * 4 + 3] === 0) bgCount++;
        if (outData[(idx - width) * 4 + 3] === 0) bgCount++;
        if (outData[(idx + width) * 4 + 3] === 0) bgCount++;

        if (bgCount > 0) {
          const r = data[dIdx], g = data[dIdx + 1], b = data[dIdx + 2];
          const sat = Math.max(r, g, b) - Math.min(r, g, b);
          if (sat < 22 && getLum(r, g, b) > 130) {
            outData[dIdx + 3] = Math.max(20, 255 - bgCount * 55);
          }
        }
      }
    }
  }

  fs.writeFileSync(outputPath, encodePNG(width, height, outData));
  console.log(`✓ Processed ${path.basename(outputPath)}`);
}

module.exports = { removeStudioBackgroundAdvanced };
