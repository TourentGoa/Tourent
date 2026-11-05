const fs = require('fs');
const zlib = require('zlib');

// CRC32 table for PNG chunk writing
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
  const raw = Buffer.alloc(width * height * 4); // convert everything to RGBA

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
    filtered[dstPos++] = 0; // None filter
    rgbaBuffer.copy(filtered, dstPos, y * rowBytes, (y + 1) * rowBytes);
    dstPos += rowBytes;
  }

  const compressed = zlib.deflateSync(filtered, { level: 9 });

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit
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

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

module.exports = { decodePNG, encodePNG };
