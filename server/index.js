import 'dotenv/config';
import {settings} from './settings.js';
import {adminRouter} from './admin.js';
import express from 'express';
import {createServer} from 'node:http';
import {Server} from 'socket.io';
import {Pool} from 'pg';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {rooms,createRoom,player,view,active,choose,advance} from './game.js';
const app=express(),http=createServer(app);
const origins=process.env.CLIENT_ORIGIN?.split(',');
const io=new Server(http,{cors:origins?{origin:origins}:undefined,maxHttpBufferSize:16000});
app.set('trust proxy',1);
app.get('/api/settings',(_,res)=>{const {prompts,...publicSettings}=settings();res.set('Cache-Control','no-store').json(publicSettings);});
app.use('/api/admin',adminRouter(value=>{const {prompts,...publicSettings}=value;io.emit('settings',publicSettings);}));
let db;
if(process.env.DATABASE_URL){db=new Pool({connectionString:process.env.DATABASE_URL});await db.query('CREATE TABLE IF NOT EXISTS game_results (id BIGSERIAL PRIMARY KEY, room_code TEXT NOT NULL, players JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())');}
app.get('/api/health',(_,res)=>res.json({ok:true,persistence:!!db}));
const dist=fileURLToPath(new URL('../client/dist/',import.meta.url));app.use(express.static(dist));app.get('/{*path}',(_,res)=>res.sendFile(path.join(dist,'index.html')));
const emit=r=>{r.updated=Date.now();io.to(r.code).emit('state',view(r));};
io.on('connection',socket=>{
 let last=0;
 socket.on('action',async(payload,ack=()=>{})=>{try{
  if(Date.now()-last<120)throw Error('Bir oz kuting.');last=Date.now();
  const {action,...data}=payload||{};
  if(action==='create'||action==='join'||action==='resume'){
   if(socket.data.code)throw Error('Avval hozirgi xonadan chiqing.');
   let r,p;
   if(action==='create')({room:r,p}=createRoom(data.name,data.gender));
   else {r=rooms.get(String(data.code).toUpperCase());if(!r)throw Error('Xona topilmadi.');
    if(action==='resume'){p=r.players.find(x=>x.token===data.token);if(!p)throw Error('Sessiya tugagan.');if(p.online)throw Error('O‘yinchi boshqa oynada ulangan.');p.online=true;}
    else {if(r.phase!=='lobby')throw Error('O‘yin boshlangan.');if(r.players.length>=12)throw Error('Xona to‘lgan.');p=player(data.name,data.gender);r.players.push(p);}}
   if(!r.players.some(x=>x.id===r.host&&x.online))r.host=p.id;
   socket.data={code:r.code,id:p.id};socket.join(r.code);ack({ok:true,session:{code:r.code,token:p.token,id:p.id}});emit(r);return;
  }
  const r=rooms.get(socket.data.code),p=r?.players.find(x=>x.id===socket.data.id);if(!r||!p)throw Error('Xonaga qayta kiring.');
  const host=()=>{if(r.host!==p.id)throw Error('Faqat xona egasi boshqaradi.');};
  if(action==='start'){host();if(r.phase!=='lobby'||r.players.filter(x=>x.online).length<2)throw Error('Kamida 2 o‘yinchi kerak.');r.phase='playing';r.turn=r.players.findIndex(x=>x.online);r.task=null;}
  else if(action==='choose')choose(r,p,data.type);
  else if(action==='complete'||action==='skip'){if(r.phase!=='playing'||active(r).id!==p.id||!r.task)throw Error('Sizning navbatingiz emas.');advance(r,action==='complete'&&Date.now()<=r.task.deadline);}
  else if(action==='custom'){host();if(r.custom.length>=100||!['truth','dare'].includes(data.type)||typeof data.text!=='string'||!data.text.trim()||data.text.length>240)throw Error('Topshiriq 1–240 belgi bo‘lsin.');r.custom.push({type:data.type,text:data.text.trim()});}
  else if(action==='finish'){host();if(r.phase!=='playing')throw Error('O‘yin boshlanmagan.');if(r.saving)throw Error('Natija saqlanmoqda.');r.saving=true;try{if(db)await db.query('INSERT INTO game_results(room_code,players) VALUES($1,$2)',[r.code,JSON.stringify(view(r).players)]);}finally{r.saving=false;}r.phase='finished';r.task=null;}
  else if(action==='restart'){host();if(r.phase!=='finished')throw Error('Avval o‘yinni yakunlang.');r.phase='lobby';r.players=r.players.filter(x=>x.online);r.players.forEach(x=>x.score=0);r.round=1;r.turn=0;r.task=null;r.used=[];}
  else if(action==='leave'){socket.leave(r.code);socket.data={};p.online=false;if(r.phase==='lobby')r.players=r.players.filter(x=>x.id!==p.id);if(r.host===p.id)r.host=r.players.find(x=>x.online)?.id;if(r.phase==='playing'&&active(r)?.id===p.id)advance(r,false);}
  else throw Error('Noma’lum amal.');
  emit(r);ack({ok:true});
 }catch(e){console.error('Action:',e.message);ack({ok:false,error:e.message});}});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.code),p=r?.players.find(x=>x.id===socket.data.id);if(!p)return;p.online=false;if(r.host===p.id)r.host=r.players.find(x=>x.online)?.id;if(r.phase==='playing'&&active(r)?.id===p.id)advance(r,false);emit(r);});
});
setInterval(()=>{for(const [code,r]of rooms){if(r.task&&Date.now()>r.task.deadline){advance(r,false);emit(r);}if(!r.players.some(p=>p.online)&&Date.now()-r.updated>3600000)rooms.delete(code);}},1000).unref();
http.listen(Number(process.env.PORT)||3001,'0.0.0.0',()=>console.log('Server ready'));
