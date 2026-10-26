/** Helpers for creating admin accounts. */

/** Random password that satisfies the backend rules (length, upper, lower, digit, special). */
export function generateTempPassword(length = 14): string {
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const special = "!@#$%^&*-_=+";
  const all = lower + upper + digits + special;

  const pick = (chars: string) => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return chars[buffer[0] % chars.length];
  };

  const chars = [pick(lower), pick(upper), pick(digits), pick(special)];
  while (chars.length < length) chars.push(pick(all));

  // Fisher-Yates so the guaranteed characters are not always first
  for (let i = chars.length - 1; i > 0; i--) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const j = buffer[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
