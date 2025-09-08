"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickWeighted = pickWeighted;
exports.angleForTopPointer = angleForTopPointer;
const node_crypto_1 = __importDefault(require("node:crypto"));
function pickWeighted(arr) {
    const total = arr.reduce((s, it) => s + Math.max(0, it.weight || 0), 0);
    const r = node_crypto_1.default.randomInt(0, total || 1);
    let acc = 0;
    for (let i = 0; i < arr.length; i++) {
        acc += Math.max(0, arr[i].weight || 0);
        if (r < acc)
            return i;
    }
    return arr.length - 1;
}
function angleForTopPointer(idx, total) {
    const seg = 360 / total;
    const jitter = (0.2 + Math.random() * 0.6) * seg;
    const indicatorAngle = idx * seg + jitter;
    return (270 - indicatorAngle + 360) % 360;
}
