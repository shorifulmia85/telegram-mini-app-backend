import express, { Application } from "express";
const app: Application = express();
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./routes";
import { envVars } from "./config";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
dotenv.config();

app.use(
  cors({
    origin: envVars.WEB_APP_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Telegram-Init-Data",
    ],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// app.set("trust proxy", true);

app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.send("Welcome to telegram mini app server");
});

app.use(notFound);
app.use(globalErrorHandler);
export default app;
