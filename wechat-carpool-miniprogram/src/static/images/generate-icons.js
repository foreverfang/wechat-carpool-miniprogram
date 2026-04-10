const fs = require('fs');
const path = require('path');

// 创建一个最简单的 PNG 图片 (81x81 纯色)
// PNG 文件格式的最小实现

function createSimplePNG(width, height, r, g, b) {
  const png = Buffer.alloc(8 + 25 + 12 + (height * (1 + width * 3)) + 12 + 12);
  let offset = 0;

  // PNG 签名
  png.write('\x89PNG\r\n\x1a\n', offset, 'binary');
  offset += 8;

  // IHDR chunk
  png.writeUInt32BE(13, offset); offset += 4;
  png.write('IHDR', offset); offset += 4;
  png.writeUInt32BE(width, offset); offset += 4;
  png.writeUInt32BE(height, offset); offset += 4;
  png.writeUInt8(8, offset); offset += 1; // bit depth
  png.writeUInt8(2, offset); offset += 1; // color type (RGB)
  png.writeUInt8(0, offset); offset += 1; // compression
  png.writeUInt8(0, offset); offset += 1; // filter
  png.writeUInt8(0, offset); offset += 1; // interlace

  // CRC for IHDR
  const crc1 = require('zlib').crc32(png.slice(offset - 17, offset));
  png.writeUInt32BE(crc1, offset); offset += 4;

  // IDAT chunk (compressed image data)
  const imageData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    imageData[y * (1 + width * 3)] = 0; // filter type
    for (let x = 0; x < width; x++) {
      const idx = y * (1 + width * 3) + 1 + x * 3;
      imageData[idx] = r;
      imageData[idx + 1] = g;
      imageData[idx + 2] = b;
    }
  }

  const compressed = require('zlib').deflateSync(imageData);
  png.writeUInt32BE(compressed.length, offset); offset += 4;
  png.write('IDAT', offset); offset += 4;
  compressed.copy(png, offset); offset += compressed.length;

  const crc2 = require('zlib').crc32(png.slice(offset - compressed.length - 4, offset));
  png.writeUInt32BE(crc2, offset); offset += 4;

  // IEND chunk
  png.writeUInt32BE(0, offset); offset += 4;
  png.write('IEND', offset); offset += 4;
  const crc3 = require('zlib').crc32(png.slice(offset - 4, offset));
  png.writeUInt32BE(crc3, offset); offset += 4;

  return png.slice(0, offset);
}

// 图标配置
const icons = ['home', 'publish', 'chat', 'profile'];
const size = 81;

// 灰色 #999999
const gray = { r: 0x99, g: 0x99, b: 0x99 };
// 蓝色 #1890FF
const blue = { r: 0x18, g: 0x90, b: 0xFF };

icons.forEach(icon => {
  // 普通状态 - 灰色
  const grayPng = createSimplePNG(size, size, gray.r, gray.g, gray.b);
  fs.writeFileSync(`${icon}.png`, grayPng);

  // 选中状态 - 蓝色
  const bluePng = createSimplePNG(size, size, blue.r, blue.g, blue.b);
  fs.writeFileSync(`${icon}-active.png`, bluePng);

  console.log(`✓ 生成 ${icon}.png 和 ${icon}-active.png`);
});

console.log('\n✅ 所有图标生成成功!');
