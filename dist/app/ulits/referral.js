"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildReferralLink = buildReferralLink;
exports.makeReferralCode = makeReferralCode;
// src/utils/referral.ts
function buildReferralLink(botUsername, code) {
    return `https://t.me/${botUsername}/rewardapp?startapp=${encodeURIComponent(code)}`;
}
function makeReferralCode(seed) {
    const base = (seed || Math.random().toString(36).slice(2) + Date.now().toString(36))
        .replace(/[^a-z0-9]/gi, "")
        .slice(0, 10);
    return `ref_${base}`;
}
