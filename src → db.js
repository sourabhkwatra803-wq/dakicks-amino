import pg from "pg"; import env from "./config.js";
const {Pool}=pg;
export const pool=new Pool({connectionString:env.DATABASE_URL,max:20,idleTimeoutMillis:30000,connectionTimeoutMillis:5000});
export async function tx(fn){const c=await pool.connect();try{await c.query("BEGIN");const r=await fn(c);await c.query("COMMIT");return r}catch(e){await c.query("ROLLBACK");throw e}finally{c.release()}}
