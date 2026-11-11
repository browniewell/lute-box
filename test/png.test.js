import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';
import { encodePng } from '../scripts/png.js';

// A 2x1 image: one red pixel, one half-clear blue pixel.
const rgba = Buffer.from([255, 0, 0, 255, 0, 0, 255, 128]);
const png = encodePng(2, 1, rgba);

function chunk(type) {
  let at = 8;
  while (at < png.length) {
    const length = png.readUInt32BE(at);
    if (png.toString('ascii', at + 4, at + 8) === type) return png.subarray(at + 8, at + 8 + length);
    at += 12 + length;
  }
  throw new Error(`no ${type} chunk`);
}

test('starts with the PNG signature', () => {
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test('the header has the size and 8-bit RGBA', () => {
  const header = chunk('IHDR');
  assert.equal(header.readUInt32BE(0), 2);
  assert.equal(header.readUInt32BE(4), 1);
  assert.equal(header[8], 8); // bits per channel
  assert.equal(header[9], 6); // RGBA
});

test('the image data holds the pixels, each row after a filter byte', () => {
  assert.deepEqual([...inflateSync(chunk('IDAT'))], [0, ...rgba]);
});

test('ends with IEND', () => {
  assert.equal(png.toString('ascii', png.length - 8, png.length - 4), 'IEND');
});

test('rejects pixel data of the wrong size', () => {
  assert.throws(() => encodePng(2, 2, rgba), /expected 16 bytes/);
});
