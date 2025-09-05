"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.envVars = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const loadEnvVariable = () => {
    const requiredValue = [
        "DB_URL",
        "PORT",
        "NODE_ENV",
        "WEB_APP_URL",
        "TELEGRAM_BOT_TOKEN",
        "INITDATA_MAX_AGE_SEC",
        "TELEGRAM_BOT_USERNAME",
        "SALT_ROUND",
        "jWT_SECRET",
        "JWT_EXPIRES_IN",
        "jWT_REFRESH_SECRET",
        "jWT_REFRESH_EXPIRES_IN",
    ];
    requiredValue.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing env variables ${key}`);
        }
    });
    return {
        DB_URL: process.env.DB_URL,
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV,
        SALT_ROUND: process.env.SALT_ROUND,
        WEB_APP_URL: process.env.WEB_APP_URL,
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
        INITDATA_MAX_AGE_SEC: process.env.INITDATA_MAX_AGE_SEC,
        TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME,
        jWT_SECRET: process.env.jWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        jWT_REFRESH_SECRET: process.env.jWT_REFRESH_SECRET,
        jWT_REFRESH_EXPIRES_IN: process.env.jWT_REFRESH_EXPIRES_IN,
    };
};
exports.envVars = loadEnvVariable();
