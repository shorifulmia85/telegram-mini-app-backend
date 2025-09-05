import mongoose from "mongoose";
import app from "./app";
const port = 5000;
import { Server } from "http";
import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import { envVars } from "./config";
const bot = new TelegramBot(envVars.TELEGRAM_BOT_TOKEN, {
  polling: true,
});

// un caught exception error handler
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

let server: Server;
async function main() {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Database connected successfully");
    server = app.listen(envVars.PORT, () => {
      console.log(`server running on port ${envVars.PORT}`);
    });

    // ✅ Setup Telegram Bot logic
    setupTelegramBot();
    setBotName();

    // ✅ Set persistent bottom menu button: "Play"
    await setPersistentMenuButton();
  } catch (error) {
    console.error(error);
  }
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
              web_app: { url: envVars.WEB_APP_URL },
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
                url: envVars.WEB_APP_URL, // 🟢 আপনার Mini App URL এখানে বসান
              },
            },
          ],
        ],
      },
    });
  });
}

// /** 🔹 Set Persistent Menu Button (Bottom "Play" Button) */
export async function setPersistentMenuButton() {
  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${envVars.TELEGRAM_BOT_TOKEN}/setChatMenuButton`,
      {
        menu_button: {
          type: "web_app",
          text: "Play", // This will appear as the button text
          web_app: {
            url: envVars.WEB_APP_URL,
          },
        },
      }
    );
    console.log("✅ Chat menu button set:", res.data);
  } catch (error) {
    console.log(error);
  }
}
main();

/** 🔻 Handle unhandled Promise rejection */
process.on("unhandledRejection", (err: any) => {
  console.error("❌ Unhandled Rejection:", err);
  if (server) {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(1);
    });
  }
});

/** 🔻 Graceful shutdown */
const gracefulShutdown = async () => {
  console.log("🔻 Shutting down...");
  if (server) {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
