export function md5(str) {
  const T = Array(64);
  for (let i = 0; i < 64; i++) T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;

  function toHex(n) {
    let h = '';
    for (let i = 0; i < 4; i++) h += ('0' + ((n >>> (i * 8)) & 0xff).toString(16)).slice(-2);
    return h;
  }

  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }

  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length * 8) % 512 !== 448) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push((bitLen >>> (i * 8)) & 0xff);

  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476;

  const gg = [
    [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    [1,6,11,0,5,10,15,4,9,14,3,8,13,2,7,12],
    [5,8,11,14,1,4,7,10,13,0,3,6,9,12,15,2],
    [0,7,14,5,12,3,10,1,8,15,6,13,4,11,2,9],
  ];

  const S = [7,12,17,22,5,9,14,20,4,11,16,23,6,10,15,21];

  for (let off = 0; off < bytes.length; off += 64) {
    const X = [];
    for (let i = 0; i < 16; i++)
      X[i] = bytes[off + i * 4] | (bytes[off + i * 4 + 1] << 8) | (bytes[off + i * 4 + 2] << 16) | (bytes[off + i * 4 + 3] << 24);

    let a = h0, b = h1, c = h2, d = h3;

    for (let i = 0; i < 64; i++) {
      const round = Math.floor(i / 16);
      const s = S[round * 4 + (i % 4)];
      const g = gg[round][i % 16];

      let f;
      if (round === 0) f = (b & c) | (~b & d);
      else if (round === 1) f = (d & b) | (~d & c);
      else if (round === 2) f = b ^ c ^ d;
      else f = c ^ (b | ~d);

      f = (f + a + T[i] + X[g]) >>> 0;
      a = d;
      d = c;
      c = b;
      b = (b + ((f << s) | (f >>> (32 - s)))) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
  }

  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

export async function getGravatarUrl(email, size = 80) {
  if (!email) return null;
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
