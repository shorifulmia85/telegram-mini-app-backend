// src/utils/referral.ts
export function buildReferralLink(botUsername: string, code: string) {
  return `https://t.me/${botUsername}/rewardapp?startapp=${encodeURIComponent(
    code
  )}`;
}

export function makeReferralCode(seed?: string) {
  const base = (
    seed || Math.random().toString(36).slice(2) + Date.now().toString(36)
  )
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 10);
  return `ref_${base}`;
}
