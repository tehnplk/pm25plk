const fs = require("fs");
const path = require("path");

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#") && line.includes("="))
    .reduce((acc, line) => {
      const index = line.indexOf("=");
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^"(.*)"$/, "$1");
      acc[key] = value;
      return acc;
    }, {});
}

const localEnv = loadEnvFile(".env.local");

module.exports = {
  apps: [
    {
      name: "gistda-hourly-worker",
      cwd: "D:\\PM2.5\\pm25plk",
      script: "node",
      args: "scripts/gistda-hourly-worker.mjs",
      autorestart: true,
      watch: false,
      time: true,
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 5000,
      env: {
        NODE_ENV: "production",
        DATABASE_URL: process.env.DATABASE_URL || localEnv.DATABASE_URL,
        DATABASE_SSL:
          process.env.DATABASE_SSL || localEnv.DATABASE_SSL || "false",
        CRON_SECRET: process.env.CRON_SECRET || localEnv.CRON_SECRET,
      },
    },
  ],
};
