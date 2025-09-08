import crypto from "node:crypto";
export function pickWeighted<T extends { weight: number }>(arr: T[]) {
  const total = arr.reduce((s, it) => s + Math.max(0, it.weight || 0), 0);
  const r = crypto.randomInt(0, total || 1);
  let acc = 0;
  for (let i = 0; i < arr.length; i++) {
    acc += Math.max(0, arr[i].weight || 0);
    if (r < acc) return i;
  }
  return arr.length - 1;
}
export function angleForTopPointer(idx: number, total: number) {
  const seg = 360 / total;
  const jitter = (0.2 + Math.random() * 0.6) * seg;
  const indicatorAngle = idx * seg + jitter;
  return (270 - indicatorAngle + 360) % 360;
}
