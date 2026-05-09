export const yen = (n: number | bigint | string | { toString(): string } | null | undefined): string => {
  if (n === null || n === undefined) return "¥0";
  const num = typeof n === "number" ? n : Number(n.toString());
  if (!Number.isFinite(num)) return "¥0";
  return `¥${num.toLocaleString("ja-JP")}`;
};

export const num = (n: number | bigint | string | { toString(): string } | null | undefined): string => {
  if (n === null || n === undefined) return "0";
  const value = typeof n === "number" ? n : Number(n.toString());
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("ja-JP");
};

export const pct = (n: number, digits = 1): string => {
  if (!Number.isFinite(n)) return "0%";
  return `${n.toFixed(digits)}%`;
};

export const dec = (value: { toString(): string } | number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : 0;
};
