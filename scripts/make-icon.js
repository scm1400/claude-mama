const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function crc32(buf) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcData = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcData));
  return Buffer.concat([len, typeBytes, data, crcVal]);
}

function makePng(size) {
  const rows = [];
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const inside = Math.sqrt(dx * dx + dy * dy) <= r;
      const i = 1 + x * 4;
      row[i]     = inside ? 0xFF : 0; // R
      row[i + 1] = inside ? 0x69 : 0; // G
      row[i + 2] = inside ? 0xB4 : 0; // B
      row[i + 3] = inside ? 0xFF : 0; // A
    }
    rows.push(row);
  }

  const raw = Buffer.concat(rows);
  const compressed = zlib.deflateSync(raw);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '..', 'build');
fs.mkdirSync(outDir, { recursive: true });

const pngPath = path.join(outDir, 'icon.png');
fs.writeFileSync(pngPath, makePng(512));
console.log('Written:', pngPath);

// For Windows ICO: write a minimal 32x32 ICO wrapping a BMP
// electron-builder can convert PNG to ICO, but we provide a simple placeholder
// ICO file with a 1x1 pixel for now; builder will use the PNG on Mac
// and on Windows it needs icon.ico — write a stub so the build doesn't fail
const icoPath = path.join(outDir, 'icon.ico');
if (!fs.existsSync(icoPath)) {
  // Minimal valid ICO: 1 image, 1x1, 32bpp
  // ICO header (6) + directory entry (16) + BMP info (40) + pixel data (4)
  const buf = Buffer.alloc(6 + 16 + 40 + 4);
  let off = 0;
  // ICONDIR
  buf.writeUInt16LE(0, off); off += 2;   // reserved
  buf.writeUInt16LE(1, off); off += 2;   // type: 1=ICO
  buf.writeUInt16LE(1, off); off += 2;   // count: 1 image
  // ICONDIRENTRY
  buf.writeUInt8(1, off); off += 1;      // width
  buf.writeUInt8(1, off); off += 1;      // height
  buf.writeUInt8(0, off); off += 1;      // color count
  buf.writeUInt8(0, off); off += 1;      // reserved
  buf.writeUInt16LE(1, off); off += 2;   // planes
  buf.writeUInt16LE(32, off); off += 2;  // bit count
  buf.writeUInt32LE(40 + 4, off); off += 4; // size of image data
  buf.writeUInt32LE(6 + 16, off); off += 4; // offset to image data
  // BITMAPINFOHEADER (40 bytes)
  buf.writeUInt32LE(40, off); off += 4;
  buf.writeInt32LE(1, off); off += 4;    // width
  buf.writeInt32LE(2, off); off += 4;    // height (2x for XOR+AND)
  buf.writeUInt16LE(1, off); off += 2;   // planes
  buf.writeUInt16LE(32, off); off += 2;  // bit count
  buf.writeUInt32LE(0, off); off += 4;   // compression
  buf.writeUInt32LE(4, off); off += 4;   // size image
  buf.writeInt32LE(0, off); off += 4;    // x pels
  buf.writeInt32LE(0, off); off += 4;    // y pels
  buf.writeUInt32LE(0, off); off += 4;   // clr used
  buf.writeUInt32LE(0, off); off += 4;   // clr important
  // Pixel: BGRA pink
  buf[off] = 0xB4; buf[off+1] = 0x69; buf[off+2] = 0xFF; buf[off+3] = 0xFF;
  fs.writeFileSync(icoPath, buf);
  console.log('Written:', icoPath);
}
