import crypto from "node:crypto";import {SignJWT,jwtVerify} from "jose";import env from "./config.js";
const key=new TextEncoder().encode(env.SESSION_SECRET);
export const issueSession=user=>new SignJWT({telegram_user_id:String(user.telegram_user_id),type:"dkx_session"}).setProtectedHeader({alg:"HS256"}).setSubject(user.id).setIssuedAt().setExpirationTime(`${env.SESSION_TTL_SECONDS}s`).sign(key);
export async function verifySession(t){const {payload}=await jwtVerify(t,key,{algorithms:["HS256"]});if(payload.type!=="dkx_session"||!payload.sub)throw Error("Invalid session");return payload}
export const randomNonce=()=>crypto.randomBytes(32).toString("base64url");
