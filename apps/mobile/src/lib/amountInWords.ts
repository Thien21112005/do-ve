/**
 * Vietnamese amount in words for prize money (T11.21), e.g.
 * 2_000_000_000 -> "Hai tỷ đồng", 1_000_005 -> "Một triệu không trăm linh năm đồng".
 *
 * Rules: "linh" for a zero tens digit, "mười" for ten, "mốt" for 1 after
 * tens >= 2, "lăm" for 5 after any tens, "không trăm" inside a number,
 * zero groups skipped, and billions recurse ("một nghìn tỷ").
 */
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readTriple(n: number, full: boolean): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  const words: string[] = [];

  if (full || h > 0) words.push(`${DIGITS[h]} trăm`);

  if (t === 0) {
    if (u > 0 && (full || h > 0)) words.push('linh');
  } else if (t === 1) {
    words.push('mười');
  } else {
    words.push(`${DIGITS[t]} mươi`);
  }

  if (u > 0) {
    if (u === 1 && t >= 2) words.push('mốt');
    else if (u === 5 && t >= 1) words.push('lăm');
    else words.push(DIGITS[u]);
  }
  return words.join(' ');
}

/** n < 1e9. The first non-zero group is read short unless `full`. */
function readBelowBillion(n: number, full: boolean): string {
  const groups: [number, string][] = [
    [Math.floor(n / 1_000_000), 'triệu'],
    [Math.floor((n % 1_000_000) / 1000), 'nghìn'],
    [n % 1000, ''],
  ];
  const parts: string[] = [];
  let leading = !full;
  for (const [value, unit] of groups) {
    if (value === 0) continue;
    const words = readTriple(value, !leading);
    parts.push(unit ? `${words} ${unit}` : words);
    leading = false;
  }
  return parts.join(' ');
}

function read(n: number, full: boolean): string {
  if (n >= 1_000_000_000) {
    const hi = Math.floor(n / 1_000_000_000);
    const lo = n % 1_000_000_000;
    const head = `${read(hi, full)} tỷ`;
    return lo > 0 ? `${head} ${readBelowBillion(lo, true)}` : head;
  }
  return readBelowBillion(n, full);
}

export function amountInWordsVN(amount: number): string {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError(`amountInWordsVN: expected a non-negative integer, got ${amount}`);
  }
  const words = amount === 0 ? 'không' : read(amount, false);
  return `${words.charAt(0).toUpperCase()}${words.slice(1)} đồng`;
}
