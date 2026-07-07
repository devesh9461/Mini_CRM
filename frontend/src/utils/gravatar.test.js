import { md5 } from './gravatar.js';

// Simple string reversal for testing
function reverse(s) { return s.split('').reverse().join(''); }

const tests = [
  ['', 'd41d8cd98f00b204e9800998ecf8427e'],
  ['a', '0cc175b9c0f1b6a831c399e269772661'],
  ['abc', '900150983cd24fb0d6963f7d28e17f72'],
  ['hello', '5d41402abc4b2a76b9719d911017c592'],
  ['devesh11e@gmail.com', '?'],
];

for (const [input, expected] of tests) {
  const got = md5(input);
  const ok = expected === '?' || got === expected;
  console.log(`${ok ? '✓' : '✗'} md5("${input}") = ${got}${expected !== '?' ? (ok ? '' : ` (expected ${expected})`) : ''}`);
}
