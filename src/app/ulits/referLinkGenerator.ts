/**
 * Mini App referral link তৈরি করে
 * @param botUsername আপনার বটের username (without @)
 * @param startParam ইউজারের pk বা custom referral code
 */
export function buildReferralLink(
  botUsername: string,
  startParam: string
): string {
  return `https://t.me/${botUsername}/rewardapp?startapp=${encodeURIComponent(
    startParam
  )}`;
}
