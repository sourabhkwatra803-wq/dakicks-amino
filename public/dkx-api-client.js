window.DKXApi=(()=>{const API="https://YOUR-BACKEND.example";let token=null;
async function req(path,opt={}){const r=await fetch(API+path,{...opt,headers:{"content-type":"application/json",...(token?{authorization:"Bearer "+token}:{}),...(opt.headers||{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||("HTTP "+r.status));return d}
async function authenticateTelegram(){const initData=window.Telegram?.WebApp?.initData;if(!initData)throw Error("Open inside Telegram");const d=await req("/v1/auth/telegram",{method:"POST",body:JSON.stringify({initData})});token=d.token;return d}
async function tonProofChallenge(){return req("/v1/ton/proof/challenge",{method:"POST",body:"{}"})}
async function verifyTonProof(wallet){const p=wallet?.connectItems?.tonProof;if(!p||!("proof"in p))throw Error("TON proof unavailable");return req("/v1/ton/proof/verify",{method:"POST",body:JSON.stringify({address:wallet.account.address,network:wallet.account.chain,publicKey:wallet.account.publicKey,walletStateInit:wallet.account.walletStateInit,proof:p.proof})})}
async function verifyTransaction(input){return req("/v1/transactions/verify",{method:"POST",body:JSON.stringify(input)})}
return{authenticateTelegram,tonProofChallenge,verifyTonProof,verifyTransaction}})();
