import {z} from "zod";
const env=z.object({
 NODE_ENV:z.string().default("production"),PORT:z.coerce.number().int().positive().default(8080),
 PUBLIC_APP_ORIGIN:z.string().url(),CORS_ORIGINS:z.string().default(""),DATABASE_URL:z.string().min(1),
 TELEGRAM_BOT_TOKEN:z.string().min(20),TELEGRAM_INITDATA_MAX_AGE_SECONDS:z.coerce.number().int().positive().default(300),
 SESSION_SECRET:z.string().min(32),SESSION_TTL_SECONDS:z.coerce.number().int().positive().default(86400),
 TON_NETWORK:z.string().default("-239"),TONCENTER_V2_URL:z.string().url().default("https://toncenter.com/api/v2"),
 TONCENTER_API_KEY:z.string().min(1),TON_PROOF_MAX_AGE_SECONDS:z.coerce.number().int().positive().default(900),
 TON_RPC_TIMEOUT_MS:z.coerce.number().int().positive().default(8000),DKX_DEPOSIT_RECIPIENT:z.string().optional(),
 DKX_MIN_DEPOSIT_NANO:z.coerce.bigint().nonnegative().default(0n)
}).parse(process.env);
export default env;
