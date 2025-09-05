"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPersistentMenuButton = setPersistentMenuButton;
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const port = 5000;
const axios_1 = __importDefault(require("axios"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const config_1 = require("./config");
const bot = new node_telegram_bot_api_1.default(config_1.envVars.TELEGRAM_BOT_TOKEN, {
    polling: true,
});
// un caught exception error handler
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.envVars.DB_URL);
            console.log("Database connected successfully");
            server = app_1.default.listen(config_1.envVars.PORT, () => {
                console.log(`server running on port ${config_1.envVars.PORT}`);
            });
            // ✅ Setup Telegram Bot logic
            setupTelegramBot();
            setBotName();
            // ✅ Set persistent bottom menu button: "Play"
            yield setPersistentMenuButton();
        }
        catch (error) {
            console.error(error);
        }
    });
}
/** 🔹 Setup Telegram bot commands */
function setupTelegramBot() {
    // Start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "🚀 Welcome to the Mini App!", {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🚀 Open Mini App",
                            web_app: { url: config_1.envVars.WEB_APP_URL },
                        },
                    ],
                ],
            },
        });
    });
    // Optional: Other commands or message handlers
}
function setBotName() {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, "Open App", {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Open Real App",
                            web_app: {
                                url: config_1.envVars.WEB_APP_URL, // 🟢 আপনার Mini App URL এখানে বসান
                            },
                        },
                    ],
                ],
            },
        });
    });
}
// /** 🔹 Set Persistent Menu Button (Bottom "Play" Button) */
function setPersistentMenuButton() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.post(`https://api.telegram.org/bot${config_1.envVars.TELEGRAM_BOT_TOKEN}/setChatMenuButton`, {
                menu_button: {
                    type: "web_app",
                    text: "Play", // This will appear as the button text
                    web_app: {
                        url: config_1.envVars.WEB_APP_URL,
                    },
                },
            });
            console.log("✅ Chat menu button set:", res.data);
        }
        catch (error) {
            console.log(error);
        }
    });
}
main();
/** 🔻 Handle unhandled Promise rejection */
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
    if (server) {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield mongoose_1.default.disconnect();
            process.exit(1);
        }));
    }
});
/** 🔻 Graceful shutdown */
const gracefulShutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔻 Shutting down...");
    if (server) {
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield mongoose_1.default.disconnect();
            process.exit(0);
        }));
    }
});
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
