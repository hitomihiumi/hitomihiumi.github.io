/** hashing algorithm: https://stackoverflow.com/a/15710692 */
export const hash = (s: string): string => {
  const reduced = s.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  return Math.abs(reduced).toString(16);
};

/** parsed hash string (key-value pairs become object properties) */
export const parseHashString = (hashString: string): Record<string, string> => {
  if (!hashString) return {};

  return Object.fromEntries(
    hashString
      .substring(1)
      ?.split("&")
      .map((v) => v.split("=")) ?? []
  );
};

/** get hash string from current window location */
export const getHashString = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  return parseHashString(window.location.hash);
};
