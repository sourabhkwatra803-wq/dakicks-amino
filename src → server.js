import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import {z} from "zod";
import env from "./config.js";
import {pool,tx as dbTx} from "./db.js";
import {validateTelegramInitData} from "./telegram.js";
import {issueSession,verifySession,randomNonce} from "./session.js";
import {verifyTonProof,normalizeTxHash,findConfirmedTonTransaction,extractIncomingTonTransfer,rawTxHashHex} from "./ton.js";

const app=Fastify({logger:true,trustProxy:true,bodyLimit:128*1024,requestIdHeader:"x-request-id"});
await app.register(helmet);
await app.register(cors,{origin:env.CORS_ORIGINS.split(",").map(x=>x.trim()).filter(Boolean)});
await app.register(rateLimit,{global:true,max:120,timeWindow:"1 minute"});

const bearer=req=>{const h=req.headers.authorization||"";return h.startsWith("Bearer ")?h.slice(7):null};
async function audit({userId,action,req,success,metadata={}}){try{await pool.query(
 `INSERT INTO audit_events(user_id,action,request_id,ip,user_agent,success,metadata) VALUES($1,$2,$3,$4,$5,$6,$7)`,
 [userId||null,action,req.id,req.ip,req.headers["user-agent"]||null,success,metadata])}catch(e){req.log.error(e,"audit failed")}}
async function auth(req,reply){
 try{
  const c=await verifySession(bearer(req));const r=await pool.query("SELECT * FROM app_users WHERE id=$1",[c.sub]);
  if(!r.rows[0])throw Error();req.user=r.rows[0];return true;
 }catch{reply.code(401).send({error:"AUTH_REQUIRED"});return false}
}

app.get("/health",async()=>({ok:true,service:"dkx-api"}));

app.post("/v1/auth/telegram",{config:{rateLimit:{max:20,timeWindow:"1 minute"}}},async(req,reply)=>{
 try{
  const {initData}=z.object({initData:z.string().min(1).max(8192)}).parse(req.body);
  const v=validateTelegramInitData(initData),tg=v.user;
  const user=await dbTx(async c=>{
   const old=await c.query("SELECT * FROM app_users WHERE telegram_user_id=$1 FOR UPDATE",[String(tg.id)]);
   if(old.rows[0])return (await c.query("UPDATE app_users SET telegram_username=$2,updated_at=now() WHERE id=$1 RETURNING *",[old.rows[0].id,tg.username||null])).rows[0];
   return (await c.query("INSERT INTO app_users(telegram_user_id,telegram_username) VALUES($1,$2) RETURNING *",[String(tg.id),tg.username||null])).rows[0];
  });
  const token=await issueSession(user);await audit({userId:user.id,action:"telegram_auth",req,success:true});
  return {ok:true,token,user:{id:user.id,telegram_user_id:String(user.telegram_user_id),telegram_username:user.telegram_username,username:user.username_normalized}};
 }catch(e){await audit({action:"telegram_auth",req,success:false,metadata:{error:e.message}});return reply.code(401).send({error:"INVALID_TELEGRAM_INITDATA"})}
});

app.post("/v1/user/username",async(req,reply)=>{
 if(!(await auth(req,reply)))return;
 try{
  const {username}=z.object({username:z.string().trim().regex(/^[A-Za-z0-9_]{3,20}$/)}).parse(req.body);
  const n=username.toLowerCase();
  const out=await dbTx(async c=>{
   const me=(await c.query("SELECT username_normalized FROM app_users WHERE id=$1 FOR UPDATE",[req.user.id])).rows[0];
   if(me?.username_normalized===n)return {ok:true,username:n};
   if((await c.query("SELECT 1 FROM username_registry WHERE username_normalized=$1",[n])).rows[0])throw Error("USERNAME_PERMANENTLY_RESERVED");
   await c.query("INSERT INTO username_registry(username_normalized,first_user_id) VALUES($1,$2)",[n,req.user.id]);
   await c.query("UPDATE app_users SET username_normalized=$2,updated_at=now() WHERE id=$1",[req.user.id,n]);
   return {ok:true,username:n};
  });
  await audit({userId:req.user.id,action:"username_claim",req,success:true});return out;
 }catch(e){await audit({userId:req.user.id,action:"username_claim",req,success:false,metadata:{error:e.message}});return reply.code(e.message==="USERNAME_PERMANENTLY_RESERVED"?409:400).send({error:e.message})}
});

app.post("/v1/ton/proof/challenge",async(req,reply)=>{
 if(!(await auth(req,reply)))return;
 const nonce=randomNonce();
 await pool.query("INSERT INTO auth_nonces(user_id,kind,nonce,expires_at) VALUES($1,'ton_proof',$2,now()+interval '15 minutes')",[req.user.id,nonce]);
 return {ok:true,payload:nonce};
});

app.post("/v1/ton/proof/verify",async(req,reply)=>{
 if(!(await auth(req,reply)))return;
 try{
  const b=z.object({
   address:z.string().min(10),network:z.string(),publicKey:z.string().regex(/^[0-9a-fA-F]{64}$/),
   walletStateInit:z.string().min(20),
   proof:z.object({timestamp:z.union([z.number(),z.string()]),domain:z.object({lengthBytes:z.number(),value:z.string()}),signature:z.string().min(20),payload:z.string().min(1)})
  }).parse(req.body);
  const nr=await pool.query(`SELECT id,nonce FROM auth_nonces WHERE user_id=$1 AND kind='ton_proof' AND nonce=$2 AND consumed_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 1`,[req.user.id,b.proof.payload]);
  if(!nr.rows[0])throw Error("TON_PROOF_NONCE_INVALID");
  await verifyTonProof({...b,expectedPayload:nr.rows[0].nonce,expectedDomain:new URL(env.PUBLIC_APP_ORIGIN).host});
  const saved=await dbTx(async c=>{
   const other=await c.query(`SELECT id FROM wallet_connections WHERE address_raw=$1 AND network=$2 AND disconnected_at IS NULL AND user_id<>$3`,[b.address,b.network,req.user.id]);
   if(other.rows[0])throw Error("WALLET_ALREADY_LINKED");
   const row=(await c.query(`INSERT INTO wallet_connections(user_id,address_raw,address_friendly,network,public_key_hex,wallet_state_init,proof_verified,proof_verified_at)
    VALUES($1,$2,$3,$4,$5,$6,true,now()) ON CONFLICT(user_id,address_raw) DO UPDATE SET network=EXCLUDED.network,address_friendly=EXCLUDED.address_friendly,public_key_hex=EXCLUDED.public_key_hex,wallet_state_init=EXCLUDED.wallet_state_init,proof_verified=true,proof_verified_at=now(),disconnected_at=NULL RETURNING *`,
    [req.user.id,b.address,b.address,b.network,b.publicKey.toLowerCase(),b.walletStateInit])).rows[0];
   await c.query("UPDATE auth_nonces SET consumed_at=now() WHERE id=$1",[nr.rows[0].id]);return row;
  });
  await audit({userId:req.user.id,action:"ton_wallet_verified",req,success:true});
  return {ok:true,wallet:{id:saved.id,address:saved.address_friendly,network:saved.network,proof_verified:true}};
 }catch(e){await audit({userId:req.user.id,action:"ton_wallet_verified",req,success:false,metadata:{error:e.message}});return reply.code(400).send({error:e.message})}
});

app.post("/v1/ton/wallet/disconnect",async(req,reply)=>{
 if(!(await auth(req,reply)))return;
 const {address}=z.object({address:z.string().min(10)}).parse(req.body);
 await pool.query("UPDATE wallet_connections SET disconnected_at=now() WHERE user_id=$1 AND address_raw=$2 AND disconnected_at IS NULL",[req.user.id,address]);
 return {ok:true};
});

app.get("/v1/ton/portfolio",async(req,reply)=>{
 if(!(await auth(req,reply)))return;
 const r=await pool.query(`SELECT id,address_raw,address_friendly,network,proof_verified,proof_verified_at,connected_at FROM wallet_connections WHERE user_id=$1 AND disconnected_at IS NULL ORDER BY connected_at DESC`,[req.user.id]);
 return {ok:true,wallets:r.rows};
});

app.post("/v1/transactions/verify",async(req,reply)=>{
 if(!(await auth(req,reply)))return;
 try{
  const b=z.object({txHash:z.string().min(40).max(100),walletAddress:z.string().min(10),recipientAddress:z.string().min(10),amountNano:z.coerce.bigint(),idempotencyKey:z.string().min(16).max(128)}).parse(req.body);
  const idem=await pool.query("SELECT response FROM idempotency_keys WHERE user_id=$1 AND key=$2",[req.user.id,b.idempotencyKey]);
  if(idem.rows[0])return idem.rows[0].response;
  const w=await pool.query(`SELECT * FROM wallet_connections WHERE user_id=$1 AND address_raw=$2 AND network=$3 AND disconnected_at IS NULL AND proof_verified=true`,[req.user.id,b.walletAddress,env.TON_NETWORK]);
  if(!w.rows[0])throw Error("VERIFIED_WALLET_REQUIRED");
  const hash=normalizeTxHash(b.txHash);
  const duplicate=await pool.query("SELECT * FROM crypto_transactions WHERE network=$1 AND tx_hash_hex=$2",[env.TON_NETWORK,hash]);
  if(duplicate.rows[0])return {ok:true,status:duplicate.rows[0].status,transaction:duplicate.rows[0]};
  const t=await findConfirmedTonTransaction({hash:b.txHash,account:b.recipientAddress});
  if(!t)throw Error("TRANSACTION_NOT_FOUND_ON_TON");
  const inMsg=extractIncomingTonTransfer(t);if(!inMsg)throw Error("NO_INCOMING_TRANSFER");
  if(inMsg.destination!==b.recipientAddress)throw Error("RECIPIENT_MISMATCH");
  if(inMsg.source&&inMsg.source!==b.walletAddress)throw Error("SENDER_MISMATCH");
  if(inMsg.valueNano<b.amountNano)throw Error("AMOUNT_TOO_LOW");
  const canonical=rawTxHashHex(t);
  const response=await dbTx(async c=>{
   const ins=await c.query(`INSERT INTO crypto_transactions(user_id,wallet_connection_id,tx_hash_hex,tx_lt,network,source_address,destination_address,asset_type,amount_base_units,status,rpc_verified_at,raw_rpc)
    VALUES($1,$2,$3,$4,$5,$6,$7,'TON',$8,'verified',now(),$9) ON CONFLICT(network,tx_hash_hex) DO NOTHING RETURNING *`,
    [req.user.id,w.rows[0].id,canonical,t.transaction_id?.lt||null,env.TON_NETWORK,inMsg.source,inMsg.destination,inMsg.valueNano.toString(),t]);
   const result={ok:true,status:"verified",transaction:ins.rows[0]};await c.query("INSERT INTO idempotency_keys(user_id,key,response) VALUES($1,$2,$3)",[req.user.id,b.idempotencyKey,result]);return result;
  });
  await audit({userId:req.user.id,action:"transaction_verified",req,success:true,metadata:{txHash:canonical}});
  return response;
 }catch(e){await audit({userId:req.user.id,action:"transaction_verified",req,success:false,metadata:{error:e.message}});return reply.code(400).send({error:e.message})}
});

app.get("/v1/me",async(req,reply)=>{
 if(!(await auth(req,reply)))return;
 return {ok:true,user:{id:req.user.id,telegram_user_id:String(req.user.telegram_user_id),telegram_username:req.user.telegram_username,username:req.user.username_normalized,balance_dkx:String(req.user.balance_dkx)}};
});
app.setErrorHandler((e,req,reply)=>{req.log.error(e);if(!reply.sent)reply.code(500).send({error:"INTERNAL_SERVER_ERROR"})});
app.addHook("onClose",async()=>pool.end());
await app.listen({host:"0.0.0.0",port:env.PORT});
