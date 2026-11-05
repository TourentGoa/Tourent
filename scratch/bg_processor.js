const fs = require('fs');
const { decodePNG, encodePNG } = require('./scratch/png_helper');

function removeStudioBackground(inputPath, outputPath, options = {}) {
  const buf = fs.readFileSync(inputPath);
  const img = decodePNG(buf);
  const { width, height, data } = img;

  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);

  // BFS Queue
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function isBackgroundPixel(r, g, b, x, y) {
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const sat = maxVal - minVal;

    // Neutral gray/white studio lighting: R, G, B are very close (sat < 18)
    // and brightness is moderate to high (maxVal > 85), or high brightness regardless of sat > 230
    if (sat <= 20 && maxVal >= 75) return true;
    if (minVal >= 225) return true; // white backdrop

    // Light neutral gradients
    if (sat <= 30 && minVal >= 130) return true;

    return false;
  }

  // Push border pixels
  for (let x = 0; x < width; x++) {
    const idxTop = x;
    const idxBottom = (height - 1) * width + x;
    
    const rT = data[idxTop * 4], gT = data[idxTop * 4 + 1], bT = data[idxTop * 4 + 2];
    if (isBackgroundPixel(rT, gT, bT, x, 0)) {
      visited[idxTop] = 1;
      isBg[idxTop] = 1;
      queue[qTail++] = idxTop;
    }

    const rB = data[idxBottom * 4], gB = data[idxBottom * 4 + 1], bB = data[idxBottom * 4 + 2];
    if (isBackgroundPixel(rB, gB, bB, x, height - 1)) {
      visited[idxBottom] = 1;
      isBg[idxBottom] = 1;
      queue[qTail++] = idxBottom;
    }
  }

  for (let y = 0; y < height; y++) {
    const idxLeft = y * width;
    const idxRight = y * width + (width - 1);

    const rL = data[idxLeft * 4], gL = data[idxLeft * 4 + 1], bL = data[idxLeft * 4 + 2];
    if (!visited[idxLeft] && isBackgroundPixel(rL, gL, bL, 0, y)) {
      visited[idxLeft] = 1;
      isBg[idxLeft] = 1;
      queue[qTail++] = idxLeft;
    }

    const rR = data[idxRight * 4], gR = data[idxRight * 4 + 1], bR = data[idxRight * 4 + 2];
    if (!visited[idxRight] && isBackgroundPixel(rR, gR, bR, width - 1, y)) {
      visited[idxRight] = 1;
      isBg[idxRight] = 1;
      queue[qTail++] = idxRight;
    }
  }

  // BFS
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    // 4 neighbors
    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1
    ];

    for (let i = 0; i < 4; i++) {
      const nIdx = neighbors[i];
      if (nIdx >= 0 && !visited[nIdx]) {
        visited[nIdx] = 1;
        const nx = nIdx % width;
        const ny = Math.floor(nIdx / width);
        const nr = data[nIdx * 4];
        const ng = data[nIdx * 4 + 1];
        const nb = data[nIdx * 4 + 2];

        if (isBackgroundPixel(nr, ng, nb, nx, ny)) {
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  // Apply alpha mask with smooth antialiased edge
  const outData = Buffer.from(data);
  let removedCount = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const dIdx = idx * 4;

      if (isBg[idx]) {
        outData[dIdx + 3] = 0; // 100% transparent
        removedCount++;
      } else {
        // Check if on the edge of background for feathering
        let bgNeighbors = 0;
        if (x > 0 && isBg[idx - 1]) bgNeighbors++;
        if (x < width - 1 && isBg[idx + 1]) bgNeighbors++;
        if (y > 0 && isBg[idx - width]) bgNeighbors++;
        if (y < height - 1 && isBg[idx + width]) bgNeighbors++;

        if (bgNeighbors > 0) {
          const r = data[dIdx], g = data[dIdx + 1], b = data[dIdx + 2];
          const sat = Math.max(r, g, b) - Math.min(r, g, b);
          if (sat < 25 && Math.max(r, g, b) > 100) {
            outData[dIdx + 3] = Math.max(0, 255 - bgNeighbors * 60);
          }
        }
      }
    }
  }

  console.log(`Processed ${inputPath}: removed ${removedCount} / ${width * height} (${Math.round(removedCount / (width * height) * 100)}%) bg pixels`);
  const encoded = encodePNG(width, height, outData);
  fs.writeFileSync(outputPath, encoded);
}

module.exports = { removeStudioBackground };
