// Minimal SHAKE256 (FIPS 202, Keccak-f[1600]) for the career chain.
// Self-contained, no dependencies. Checked against Python hashlib.shake_256.
(function (root) {
  const M = (1n << 64n) - 1n;
  const RC = [
    0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
    0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
    0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
    0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
    0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
    0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n
  ];
  // rotation offsets r[x + 5y]
  const R = [0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14];
  const rot = (v, n) => (n === 0 ? v : ((v << BigInt(n)) | (v >> BigInt(64 - n))) & M);

  function keccakF(A) {
    const C = new Array(5), B = new Array(25);
    for (let round = 0; round < 24; round++) {
      for (let x = 0; x < 5; x++) C[x] = A[x] ^ A[x + 5] ^ A[x + 10] ^ A[x + 15] ^ A[x + 20];
      for (let x = 0; x < 5; x++) {
        const D = C[(x + 4) % 5] ^ rot(C[(x + 1) % 5], 1);
        for (let y = 0; y < 25; y += 5) A[x + y] ^= D;
      }
      for (let x = 0; x < 5; x++)
        for (let y = 0; y < 5; y++)
          B[y + 5 * ((2 * x + 3 * y) % 5)] = rot(A[x + 5 * y], R[x + 5 * y]);
      for (let x = 0; x < 5; x++)
        for (let y = 0; y < 25; y += 5)
          A[x + y] = B[x + y] ^ ((~B[((x + 1) % 5) + y] & M) & B[((x + 2) % 5) + y]);
      A[0] ^= RC[round];
    }
  }

  // bytes: Uint8Array, outLen: output length in bytes. Returns lowercase hex.
  function shake256(bytes, outLen) {
    const rate = 136; // 1088-bit rate for SHAKE256
    const A = new Array(25).fill(0n);
    const padded = new Uint8Array(Math.ceil((bytes.length + 1) / rate) * rate);
    padded.set(bytes);
    padded[bytes.length] ^= 0x1f;      // SHAKE domain separation + pad10*1 start
    padded[padded.length - 1] ^= 0x80; // pad10*1 end
    for (let off = 0; off < padded.length; off += rate) {
      for (let i = 0; i < rate / 8; i++) {
        let lane = 0n;
        for (let b = 7; b >= 0; b--) lane = (lane << 8n) | BigInt(padded[off + i * 8 + b]);
        A[i] ^= lane;
      }
      keccakF(A);
    }
    let hex = '';
    while (true) {
      for (let i = 0; i < rate / 8; i++) {
        let lane = A[i];
        for (let b = 0; b < 8; b++) {
          hex += Number(lane & 0xffn).toString(16).padStart(2, '0');
          lane >>= 8n;
          if (hex.length === outLen * 2) return hex;
        }
      }
      keccakF(A);
    }
  }

  root.shake256 = shake256;
  if (typeof module !== 'undefined') module.exports = shake256;
})(typeof window !== 'undefined' ? window : globalThis);
