import dotenv from "dotenv";
dotenv.config();

interface IEnvConfig {
  DB_URL: string;
  PORT: string;
  NODE_ENV: string;
  WEB_APP_URL: string;
  TELEGRAM_BOT_TOKEN: string;
  INITDATA_MAX_AGE_SEC: string;
  TELEGRAM_BOT_USERNAME: string;

  SALT_ROUND: string;
  jWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  jWT_REFRESH_SECRET: string;
  jWT_REFRESH_EXPIRES_IN: string;
}

const loadEnvVariable = (): IEnvConfig => {
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
    DB_URL: process.env.DB_URL as string,
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as string,
    SALT_ROUND: process.env.SALT_ROUND as string,
    WEB_APP_URL: process.env.WEB_APP_URL as string,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN as string,
    INITDATA_MAX_AGE_SEC: process.env.INITDATA_MAX_AGE_SEC as string,
    TELEGRAM_BOT_USERNAME: process.env.TELEGRAM_BOT_USERNAME as string,

    jWT_SECRET: process.env.jWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
    jWT_REFRESH_SECRET: process.env.jWT_REFRESH_SECRET as string,
    jWT_REFRESH_EXPIRES_IN: process.env.jWT_REFRESH_EXPIRES_IN as string,
  };
};

export const envVars = loadEnvVariable();
