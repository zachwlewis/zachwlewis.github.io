const FEISTEL_KEYS = [0xdeadbeef, 0x12345678, 0xcafebabe, 0x87654321];

function f(right, key) {
  return ((right ^ key) * 0x1234) & 0xffff;
}

function encode(value) {
  value &= 0xffffffff;
  left = (value >>> 16) & 0xffff;
  right = value & 0xffff;

  // perform rounds forward
  for (let key of FEISTEL_KEYS) {
    [left, right] = [right, left ^ f(right, key)];
  }

  // Use >>> 0 to convert to unsigned 32-bit integer
  return ((left << 16) | right) >>> 0;
}

function decode(value) {
  value &= 0xffffffff;
  left = (value >>> 16) & 0xffff;
  right = value & 0xffff;

  // perform rounds backward
  for (let key of FEISTEL_KEYS.slice().reverse()) {
    [left, right] = [right ^ f(left, key), left];
  }

  // Use >>> 0 to convert to unsigned 32-bit integer
  return ((left << 16) | right) >>> 0;
}

window.encode = encode;
window.decode = decode;
