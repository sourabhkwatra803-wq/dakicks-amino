import crypto from "node:crypto";
import {Address,Cell,contractAddress,domainSignVerify,loadStateInit,WalletContractV1R1,WalletContractV1R2,WalletContractV1R3,WalletContractV2R1,WalletContractV2R2,WalletContractV3R1,WalletContractV3R2,WalletContractV4,WalletContractV5R1} from "@ton/ton";
import env from "./config.js";

const P1="ton-proof-item-v2/",P2="ton-connect";
const fetchTon=async(path,opt={})=>{
  const r=await fetch(`${env.TONCENTER_V2_URL}${path}`,{
    ...opt,headers:{"content-type":"application/json","X-API-Key":env.TONCENTER_API_KEY,...(opt.headers||{})},
    signal:AbortSignal.timeout(env.TON_RPC_TIMEOUT_MS)
  });
  const b=await r.json().catch(()=>({}));
  if(!r.ok||b.ok===false)throw Error(`TON RPC error ${r.status}`);
  return b.result;
};

function loaders(){
 const v1=cs=>{cs.loadUint(32);return cs.loadBuffer(32)},v2=cs=>{cs.loadUint(32);return cs.loadBuffer(32)};
 const v3=cs=>{cs.loadUint(32);cs.loadUint(32);return cs.loadBuffer(32)};
 const v4=cs=>{cs.loadUint(32);cs.loadUint(32);return cs.loadBuffer(32)};
 const v5=cs=>{cs.loadBoolean();cs.loadUint(32);cs.loadUint(32);return cs.loadBuffer(32)};
 return [
  [WalletContractV1R1,v1],[WalletContractV1R2,v1],[WalletContractV1R3,v1],
  [WalletContractV2R1,v2],[WalletContractV2R2,v2],[WalletContractV3R1,v3],[WalletContractV3R2,v3],
  [WalletContractV4,v4],[WalletContractV5R1,v5]
 ].map(([c,load])=>({hash:c.create({workchain:0,publicKey:Buffer.alloc(32)}).init.code.hash().toString("hex"),load}));
}
const known=loaders();

function extract(state){
 const x=known.find(k=>k.hash===state.code.hash().toString("hex"));if(!x)return null;
 try{return x.load(state.data.beginParse())}catch{return null}
}

async function getPublicKey(address){
 const r=await fetchTon("/runGetMethod",{method:"POST",body:JSON.stringify({address,method:"get_public_key",stack:[]})});
 const item=r?.stack?.[0],raw=item?.[1]??item?.value??item?.num;if(raw==null)return null;
 let n=BigInt(String(raw));const out=Buffer.alloc(32);for(let i=31;i>=0;i--){out[i]=Number(n&255n);n>>=8n}return out;
}
const sigDomain=n=>n==="-239"||n==="-3"?{type:"empty"}:{type:"l2",globalId:Number(n)};

function digest(addr,p){
 const wc=Buffer.alloc(4);wc.writeInt32BE(addr.workChain);
 const d=Buffer.from(p.domain.value),dl=Buffer.alloc(4);dl.writeUInt32LE(d.length);
 const ts=Buffer.alloc(8);ts.writeBigUInt64LE(BigInt(p.timestamp));
 const msg=Buffer.concat([Buffer.from(P1),wc,addr.hash,dl,d,ts,Buffer.from(p.payload)]);
 const mh=crypto.createHash("sha256").update(msg).digest();
 return crypto.createHash("sha256").update(Buffer.concat([Buffer.from([255,255]),Buffer.from(P2),mh])).digest();
}

export async function verifyTonProof({address,walletStateInit,publicKeyHex,network,proof,expectedPayload,expectedDomain}){
 if(network!==env.TON_NETWORK)throw Error("Wrong TON network");
 if(!proof||proof.payload!==expectedPayload)throw Error("TON proof payload mismatch");
 if(proof.domain?.value!==expectedDomain)throw Error("TON proof domain mismatch");
 const ts=Number(proof.timestamp),now=Math.floor(Date.now()/1000);
 if(!Number.isFinite(ts)||Math.abs(now-ts)>env.TON_PROOF_MAX_AGE_SECONDS)throw Error("TON proof expired");
 if(!walletStateInit)throw Error("walletStateInit required");
 if(!/^[0-9a-fA-F]{64}$/.test(publicKeyHex||""))throw Error("Wallet public key required");
 const addr=Address.parse(address),state=loadStateInit(Cell.fromBase64(walletStateInit).beginParse());
 if(!contractAddress(addr.workChain,state).equals(addr))throw Error("walletStateInit/address mismatch");
 const pk=extract(state)||await getPublicKey(address);if(!pk)throw Error("Could not resolve wallet public key");
 const reported=Buffer.from(publicKeyHex,"hex");if(!crypto.timingSafeEqual(pk,reported))throw Error("Wallet public key mismatch");
 const ok=domainSignVerify({data:digest(addr,proof),signature:Buffer.from(proof.signature,"base64"),publicKey:pk,domain:sigDomain(network)});
 if(!ok)throw Error("Invalid TON proof signature");return true;
}

export function normalizeTxHash(h){
 const s=String(h||"").trim();
 if(/^[0-9a-fA-F]{64}$/.test(s))return s.toUpperCase();
 const b=Buffer.from(s,"base64");if(b.length!==32)throw Error("Invalid transaction hash");return b.toString("hex").toUpperCase();
}
export async function findConfirmedTonTransaction({hash,account}){
 const target=normalizeTxHash(hash),rows=await fetchTon(`/getTransactions?address=${encodeURIComponent(account)}&limit=50&archival=true`);
 return (rows||[]).find(t=>normalizeTxHash(t?.transaction_id?.hash||"")===target)||null;
}
export function extractIncomingTonTransfer(tx){
 const m=tx?.in_msg;if(!m?.destination)return null;
 return {source:m.source||null,destination:m.destination,valueNano:BigInt(m.value||"0"),messageHash:m.hash||null};
}
export const rawTxHashHex=tx=>normalizeTxHash(tx?.transaction_id?.hash||"");
