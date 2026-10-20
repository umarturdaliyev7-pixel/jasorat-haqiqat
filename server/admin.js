import {Router,json} from 'express';
import {randomBytes,scryptSync,timingSafeEqual,createHmac} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {settings,saveSettings,dataDir,atomicWrite} from './settings.js';
export function adminRouter(onChange=()=>{}){
 const router=Router();router.use(json({limit:'400kb'}));router.use((req,res,next)=>{res.set('Cache-Control','no-store');next();});
 const secret=process.env.ADMIN_SECRET||randomBytes(32).toString('hex');
 let credential;try{credential=JSON.parse(fs.readFileSync(path.join(dataDir,'admin.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const hash=(password,salt)=>scryptSync(password,salt,64).toString('hex');
 const equal=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);};
 const sign=value=>createHmac('sha256',secret).update(value).digest('hex');
 const version=()=>credential?.hash||sign(process.env.ADMIN_PASSWORD||'disabled');
 const token=()=>{const value=Buffer.from(JSON.stringify({expires:Date.now()+8*3600000,version:sign(version())})).toString('base64url');return value+'.'+sign(value);};
 const authorized=req=>{try{const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('jh_admin='))?.slice(9);if(!raw)return false;const [v,s]=raw.split('.');if(!equal(sign(v),s))return false;const data=JSON.parse(Buffer.from(v,'base64url').toString());return data.expires>Date.now()&&equal(data.version,sign(version()));}catch{return false;}};
 const cookie=(res,value,maxAge)=>res.cookie('jh_admin',value,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/api/admin',maxAge});
 const attempts=new Map();
 router.post('/login',(req,res)=>{
  const key=req.ip,now=Date.now();if(attempts.size>1000)for(const [k,v]of attempts)if(v.reset<now)attempts.delete(k);
  let entry=attempts.get(key);if(!entry||entry.reset<now){entry={count:0,reset:now+600000};attempts.set(key,entry);}if(entry.count>=10)return res.status(429).json({error:'Ko‘p urinish. 10 daqiqadan keyin qayta urinib ko‘ring.'});entry.count++;
  const password=req.body?.password;if(typeof password!=='string'||password.length>200)return res.status(401).json({error:'Parol noto‘g‘ri.'});
  const ok=credential?equal(hash(password,credential.salt),credential.hash):!!process.env.ADMIN_PASSWORD&&equal(hash(password,'bootstrap'),hash(process.env.ADMIN_PASSWORD,'bootstrap'));
  if(!ok)return res.status(401).json({error:'Parol noto‘g‘ri.'});attempts.delete(key);cookie(res,token(),8*3600000);res.json({ok:true});
 });
 router.use((req,res,next)=>authorized(req)?next():res.status(401).json({error:'Admin sifatida kiring.'}));
 router.use((req,res,next)=>req.method==='GET'||req.headers['x-admin-request']==='1'?next():res.status(403).json({error:'So‘rov rad etildi.'}));
 router.get('/settings',(_,res)=>res.json(settings()));
 router.put('/settings',(req,res)=>{try{const value=saveSettings(req.body);onChange(value);res.json(value);}catch(e){res.status(400).json({error:e.message});}});
 router.post('/password',(req,res)=>{const password=req.body?.password;if(typeof password!=='string'||password.length<12||password.length>128)return res.status(400).json({error:'Parol 12–128 belgi bo‘lsin.'});const salt=randomBytes(16).toString('hex');const next={salt,hash:hash(password,salt)};try{atomicWrite('admin.json',next);credential=next;cookie(res,token(),8*3600000);res.json({ok:true});}catch{res.status(500).json({error:'Parolni saqlab bo‘lmadi.'});}});
 router.post('/logout',(_,res)=>{cookie(res,'',0);res.json({ok:true});});
 return router;
}
