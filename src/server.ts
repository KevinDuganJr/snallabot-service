import Koa from "koa"
import bodyParser from "@koa/bodyparser"
import serve from "koa-static"
import path from "path"
import exportRouter from "./export/routes"
//import discordRouter from "./discord/routes"
//import twitchRouter from "./twitch-notifier/routes"
import connectionsRouter from "./connections/routes"
import debugRouter from "./debug/routes"
import dashboard from "./dashboard/routes"
import fs from 'fs';

const app = new Koa()

app
  .use(serve(path.join(__dirname, 'public')))
  .use(bodyParser({ enableTypes: ["json", "form"], encoding: "utf-8", jsonLimit: "100mb" }))
  .use(async (ctx, next) => {
    try {
      await next()
    } catch (err: any) {
      ctx.status = 500;
      ctx.body = {
        message: err.message
      };
    }
  })
  .use(exportRouter.routes())
  .use(exportRouter.allowedMethods())
  //.use(discordRouter.routes())
  //.use(discordRouter.allowedMethods())
  //.use(twitchRouter.routes())
  //.use(twitchRouter.allowedMethods())
  .use(connectionsRouter.routes())
  .use(connectionsRouter.allowedMethods())
  .use(debugRouter.routes())
  .use(debugRouter.allowedMethods())
  .use(dashboard.routes())
  .use(dashboard.allowedMethods())

export default app

const envRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  || process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64
  || process.env.SERVICE_ACCOUNT_FILE;

if (!envRaw) {
  console.error('FIREBASE_SERVICE_ACCOUNT_KEY (or FIREBASE_SERVICE_ACCOUNT_KEY_B64 or SERVICE_ACCOUNT_FILE) is not set.');
  process.exit(1);
}

let serviceAccountObject: unknown | null = null;

const tryParse = (s: string) => {
  try { return JSON.parse(s); } catch { return null; }
};

// 1) Try raw JSON
serviceAccountObject = tryParse(envRaw);

// 2) If not JSON, try base64 decode (common for CI/Heroku safety)
if (!serviceAccountObject) {
  try {
    const decoded = Buffer.from(envRaw, 'base64').toString('utf8');
    serviceAccountObject = tryParse(decoded);
  } catch { /* ignore */ }
}

// 3) If still not, treat env as a local file path (dev convenience)
if (!serviceAccountObject) {
  try {
    const fileContents = fs.readFileSync(envRaw, 'utf8');
    serviceAccountObject = tryParse(fileContents);
  } catch { /* ignore */ }
}

if (!serviceAccountObject) {
  console.error('Failed to obtain valid Firebase service account JSON. Provide:\n' +
    '- FIREBASE_SERVICE_ACCOUNT_KEY: raw JSON string\n' +
    '- FIREBASE_SERVICE_ACCOUNT_KEY_B64: base64(JSON)\n' +
    '- or SERVICE_ACCOUNT_FILE: local path to JSON (dev only)');
  process.exit(1);
}

// serviceAccountObject is a parsed JS object you can pass to firebase admin
const serviceAccount = serviceAccountObject as Record<string, unknown>;
// ... initialize firebase admin with `serviceAccount`
