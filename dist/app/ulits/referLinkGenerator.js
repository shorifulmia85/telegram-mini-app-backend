"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReferralLink = buildReferralLink;
/**
 * Mini App referral link তৈরি করে
 * @param botUsername আপনার বটের username (without @)
 * @param startParam ইউজারের pk বা custom referral code
 */
function buildReferralLink(botUsername, startParam) {
    return `https://t.me/${botUsername}/rewardapp?startapp=${encodeURIComponent(startParam)}`;
}
