"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const telegramAuth_interface_1 = require("./telegramAuth.interface");
const userSchema = new mongoose_1.Schema({
    tgId: { type: Number, required: true, unique: true },
    userName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    country: { type: String },
    ip: { type: String },
    photo: { type: String },
    role: {
        type: String,
        enum: Object.values(telegramAuth_interface_1.UserRole),
        default: telegramAuth_interface_1.UserRole.USER,
    },
    status: {
        type: String,
        enum: Object.values(telegramAuth_interface_1.IAuthStatus),
        default: telegramAuth_interface_1.IAuthStatus.ACTIVE,
    },
    referCode: { type: String, required: true },
    referLink: { type: String, required: true },
    balance: { type: Number, default: 0 },
    lifeTimeBalance: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    referred_by: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.User = (0, mongoose_1.model)("User", userSchema);
