const fs = require('fs');
const zlib = require('zlib');
const path = require('path');
const { decodePNG, encodePNG } = require('./png_helper');

function getLum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function removeBackground(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  const { width, height, data } = decodePNG(buf);

  // 1. Sample the outer border to determine background type
  let borderPixels = [];
  for (let x = 0; x < width; x++) {
    const idxT = x * 4;
    const idxB = ((height - 1) * width + x) * 4;
    borderPixels.push([data[idxT], data[idxT+1], data[idxT+2]]);
    borderPixels.push([data[idxB], data[idxB+1], data[idxB+2]]);
  }
  for (let y = 0; y < height; y++) {
    const idxL = (y * width) * 4;
    const idxR = (y * width + (width - 1)) * 4;
    borderPixels.push([data[idxL], data[idxL+1], data[idxL+2]]);
    borderPixels.push([data[idxR], data[idxR+1], data[idxR+2]]);
  }

  // Find median border color
  const rArr = borderPixels.map(p => p[0]).sort((a,b)=>a-b);
  const gArr = borderPixels.map(p => p[1]).sort((a,b)=>a-b);
  const bArr = borderPixels.map(p => p[2]).sort((a,b)=>a-b);

  const bgR = rArr[Math.floor(rArr.length / 2)];
  const bgG = gArr[Math.floor(gArr.length / 2)];
  const bgB = bArr[Math.floor(bArr.length / 2)];
  const bgLum = getLum(bgR, bgG, bgB);
  const isWhiteBg = bgLum >= 240;

  console.log(`[${path.basename(inputPath)}] Detected bg: RGB(${bgR}, ${bgG}, ${bgB}), Lum: ${bgLum.toFixed(1)}, isWhite: ${isWhiteBg}`);

  // 2. Compute edge magnitude map (Sobel-like gradient) to prevent leaking into white cars
  const edges = new Float32Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const dIdx = idx * 4;
      
      const r = data[dIdx], g = data[dIdx+1], b = data[dIdx+2];

      const rX = data[dIdx + 4] - data[dIdx - 4];
      const gX = data[dIdx + 5] - data[dIdx - 3];
      const bX = data[dIdx + 6] - data[dIdx - 2];

      const rY = data[dIdx + width * 4] - data[dIdx - width * 4];
      const gY = data[dIdx + width * 4 + 1] - data[dIdx - width * 4 + 1];
      const bY = data[dIdx + width * 4 + 2] - data[dIdx - width * 4 + 2];

      const gx = Math.abs(rX) + Math.abs(gX) + Math.abs(bX);
      const gy = Math.abs(rY) + Math.abs(gY) + Math.abs(bY);
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // 3. Flood Fill BFS from outer border
  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function isBgPixel(x, y, fromR, fromG, fromB) {
    const idx = y * width + x;
    const dIdx = idx * 4;
    const r = data[dIdx], g = data[dIdx+1], b = data[dIdx+2];
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    const lum = getLum(r, g, b);

    // If strong edge detected, stop!
    if (edges[idx] > 35) return false;

    // Saturated pixel = Car body, definitely not background
    if (sat > 22) return false;

    // Color distance from detected background
    const distFromBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

    if (isWhiteBg) {
      // White studio backdrop: strictly neutral white/near-white
      if (sat <= 12 && minVal(r,g,b) >= 235) return true;
      if (sat <= 18 && minVal(r,g,b) >= 245) return true;
      // If moving from neighbor with small step
      if (fromR !== undefined) {
        const step = Math.abs(r - fromR) + Math.abs(g - fromG) + Math.abs(b - fromB);
        if (step > 25) return false;
        if (sat <= 10 && lum >= 225) return true;
      }
      return false;
    } else {
      // Grey studio backdrop (e.g. 224, 224, 226 or gradient)
      if (distFromBg < 35 && sat <= 15) return true;
      if (minVal(r,g,b) >= 235) return true;
      if (fromR !== undefined) {
        const step = Math.abs(r - fromR) + Math.abs(g - fromG) + Math.abs(b - fromB);
        if (step > 30) return false;
        if (sat <= 18 && lum >= 110) return true;
      }
      return (sat <= 15 && lum >= 120);
    }
  }

  function minVal(r, g, b) { return Math.min(r, g, b); }

  // Seed boundary
  for (let x = 0; x < width; x++) {
    const idxT = x;
    const idxB = (height - 1) * width + x;
    if (isBgPixel(x, 0)) { visited[idxT] = 1; isBg[idxT] = 1; queue[qTail++] = idxT; }
    if (isBgPixel(x, height - 1)) { visited[idxB] = 1; isBg[idxB] = 1; queue[qTail++] = idxB; }
  }
  for (let y = 0; y < height; y++) {
    const idxL = y * width;
    const idxR = y * width + (width - 1);
    if (!visited[idxL] && isBgPixel(0, y)) { visited[idxL] = 1; isBg[idxL] = 1; queue[qTail++] = idxL; }
    if (!visited[idxR] && isBgPixel(width - 1, y)) { visited[idxR] = 1; isBg[idxR] = 1; queue[qTail++] = idxR; }
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
        const nx = nIdx % width;
        const ny = Math.floor(nIdx / width);

        if (isBgPixel(nx, ny, cr, cg, cb)) {
          visited[nIdx] = 1;
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  // Create output RGBA buffer
  const outData = Buffer.from(data);
  let removedCount = 0;
  for (let idx = 0; idx < width * height; idx++) {
    if (isBg[idx]) {
      outData[idx * 4 + 3] = 0;
      removedCount++;
    }
  }

  // 4. Smooth antialiasing on silhouette boundary
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
          const distFromBg = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
          if (distFromBg < 60) {
            outData[dIdx + 3] = Math.max(30, 255 - bgCount * 50);
          }
        }
      }
    }
  }

  const pct = Math.round((removedCount / (width * height)) * 100);
  console.log(`✓ ${path.basename(inputPath)}: ${pct}% background removed.`);
  fs.writeFileSync(outputPath, encodePNG(width, height, outData));
  return pct;
}

module.exports = { removeBackground };
