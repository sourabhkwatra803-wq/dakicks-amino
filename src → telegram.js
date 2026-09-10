import crypto from "node:crypto"; import env from "./config.js";
function eq(a,b){const x=Buffer.from(a,"hex"),y=Buffer.from(b,"hex");return x.length===y.length&&crypto.timingSafeEqual(x,y)}
export function validateTelegramInitData(raw){
 if(!raw||raw.length>8192)throw Error("Missing Telegram initData");
 const p=new URLSearchParams(raw),hash=p.get("hash");
 if(!hash||!/^[a-f0-9]{64}$/i.test(hash))throw Error("Invalid Telegram initData hash");
 const pairs=[];for(const [k,v] of p.entries())if(k!=="hash")pairs.push(`${k}=${v}`);
 pairs.sort();const d=pairs.join("\n");
 const secret=crypto.createHmac("sha256","WebAppData").update(env.TELEGRAM_BOT_TOKEN).digest();
 const calc=crypto.createHmac("sha256",secret).update(d).digest("hex");
 if(!eq(calc,hash))throw Error("Telegram initData signature invalid");
 const authDate=Number(p.get("auth_date")||0),age=Math.floor(Date.now()/1000)-authDate;
 if(!Number.isFinite(authDate)||authDate<=0||age<-30||age>env.TELEGRAM_INITDATA_MAX_AGE_SECONDS)throw Error("Telegram initData expired");
 let user;try{user=JSON.parse(p.get("user")||"null")}catch{throw Error("Telegram user payload invalid")}
 if(!user?.id)throw Error("Telegram user missing");
 return {user,authDate,startParam:p.get("start_param")||null};
}
