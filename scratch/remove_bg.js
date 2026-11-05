const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function decodePNG(buf) {
  let pos = 8;
  let width, height, bitDepth, colorType;
  const idatChunks = [];

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const rowBytes = width * bpp;
  const raw = Buffer.alloc(width * height * 4);

  let srcPos = 0;
  const prevRow = Buffer.alloc(rowBytes);
  const curRow = Buffer.alloc(rowBytes);

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < height; y++) {
    const filter = decompressed[srcPos++];
    for (let x = 0; x < rowBytes; x++) {
      const val = decompressed[srcPos++];
      const left = x >= bpp ? curRow[x - bpp] : 0;
      const up = prevRow[x];
      const upLeft = x >= bpp ? prevRow[x - bpp] : 0;

      let unfilter = 0;
      if (filter === 0) unfilter = val;
      else if (filter === 1) unfilter = (val + left) & 0xFF;
      else if (filter === 2) unfilter = (val + up) & 0xFF;
      else if (filter === 3) unfilter = (val + Math.floor((left + up) / 2)) & 0xFF;
      else if (filter === 4) unfilter = (val + paeth(left, up, upLeft)) & 0xFF;

      curRow[x] = unfilter;
    }

    curRow.copy(prevRow);

    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      if (colorType === 6) {
        raw[dstIdx] = curRow[x * 4];
        raw[dstIdx + 1] = curRow[x * 4 + 1];
        raw[dstIdx + 2] = curRow[x * 4 + 2];
        raw[dstIdx + 3] = curRow[x * 4 + 3];
      } else if (colorType === 2) {
        raw[dstIdx] = curRow[x * 3];
        raw[dstIdx + 1] = curRow[x * 3 + 1];
        raw[dstIdx + 2] = curRow[x * 3 + 2];
        raw[dstIdx + 3] = 255;
      }
    }
  }

  return { width, height, data: raw };
}

function encodePNG(width, height, rgbaBuffer) {
  const rowBytes = width * 4;
  const filtered = Buffer.alloc(height * (rowBytes + 1));

  let dstPos = 0;
  for (let y = 0; y < height; y++) {
    filtered[dstPos++] = 0;
    rgbaBuffer.copy(filtered, dstPos, y * rowBytes, (y + 1) * rowBytes);
    dstPos += rowBytes;
  }

  const compressed = zlib.deflateSync(filtered, { level: 9 });
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  function makeChunk(typeStr, data) {
    const typeBuf = Buffer.from(typeStr, 'ascii');
    const len = data.length;
    const chunk = Buffer.alloc(12 + len);
    chunk.writeUInt32BE(len, 0);
    typeBuf.copy(chunk, 4);
    data.copy(chunk, 8);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    chunk.writeUInt32BE(crcVal, 8 + len);
    return chunk;
  }

  return Buffer.concat([signature, makeChunk('IHDR', ihdr), makeChunk('IDAT', compressed), makeChunk('IEND', Buffer.alloc(0))]);
}

function processCarImage(inputPath, outputPath) {
  const buf = fs.readFileSync(inputPath);
  const { width, height, data } = decodePNG(buf);

  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function isStudioBg(r, g, b, x, y) {
    const maxVal = Math.max(r, g, b);
    const minVal = Math.min(r, g, b);
    const sat = maxVal - minVal;

    // Neutral gray/white studio lighting vignette:
    // 1. High brightness
    if (minVal >= 235) return true;
    
    // 2. Neutral grey studio backdrop (low saturation, moderate-to-high luminance)
    if (sat <= 22 && maxVal >= 70) return true;
    if (sat <= 35 && minVal >= 135) return true;

    return false;
  }

  // Push border pixels
  for (let x = 0; x < width; x++) {
    const idxTop = x;
    const idxBottom = (height - 1) * width + x;

    const rT = data[idxTop * 4], gT = data[idxTop * 4 + 1], bT = data[idxTop * 4 + 2];
    if (isStudioBg(rT, gT, bT, x, 0)) {
      visited[idxTop] = 1; isBg[idxTop] = 1; queue[qTail++] = idxTop;
    }

    const rB = data[idxBottom * 4], gB = data[idxBottom * 4 + 1], bB = data[idxBottom * 4 + 2];
    if (isStudioBg(rB, gB, bB, x, height - 1)) {
      visited[idxBottom] = 1; isBg[idxBottom] = 1; queue[qTail++] = idxBottom;
    }
  }

  for (let y = 0; y < height; y++) {
    const idxLeft = y * width;
    const idxRight = y * width + (width - 1);

    const rL = data[idxLeft * 4], gL = data[idxLeft * 4 + 1], bL = data[idxLeft * 4 + 2];
    if (!visited[idxLeft] && isStudioBg(rL, gL, bL, 0, y)) {
      visited[idxLeft] = 1; isBg[idxLeft] = 1; queue[qTail++] = idxLeft;
    }

    const rR = data[idxRight * 4], gR = data[idxRight * 4 + 1], bR = data[idxRight * 4 + 2];
    if (!visited[idxRight] && isStudioBg(rR, gR, bR, width - 1, y)) {
      visited[idxRight] = 1; isBg[idxRight] = 1; queue[qTail++] = idxRight;
    }
  }

  // BFS
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

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
        const nr = data[nIdx * 4], ng = data[nIdx * 4 + 1], nb = data[nIdx * 4 + 2];

        if (isStudioBg(nr, ng, nb, nx, ny)) {
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }
  }

  const outData = Buffer.from(data);
  let count = 0;
  for (let idx = 0; idx < width * height; idx++) {
    if (isBg[idx]) {
      outData[idx * 4 + 3] = 0; // alpha = 0
      count++;
    }
  }

  // Feather edges
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (!isBg[idx]) {
        let bgNeighbors = 0;
        if (isBg[idx - 1]) bgNeighbors++;
        if (isBg[idx + 1]) bgNeighbors++;
        if (isBg[idx - width]) bgNeighbors++;
        if (isBg[idx + width]) bgNeighbors++;

        if (bgNeighbors > 0) {
          const dIdx = idx * 4;
          const r = data[dIdx], g = data[dIdx + 1], b = data[dIdx + 2];
          const sat = Math.max(r, g, b) - Math.min(r, g, b);
          if (sat < 28 && Math.max(r, g, b) > 90) {
            outData[dIdx + 3] = Math.max(20, 255 - bgNeighbors * 55);
          }
        }
      }
    }
  }

  console.log(`✓ ${path.basename(inputPath)}: ${Math.round(count / (width * height) * 100)}% background removed.`);
  fs.writeFileSync(outputPath, encodePNG(width, height, outData));
}

module.exports = { processCarImage };
