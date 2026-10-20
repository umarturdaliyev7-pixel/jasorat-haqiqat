import {randomBytes,randomInt,randomUUID} from 'node:crypto';
import {settings} from './settings.js';
export const rooms=new Map();
export const cleanName=v=>typeof v==='string'?v.trim().slice(0,24):'';
export function player(name,gender){if(!['male','female'].includes(gender))throw Error('O‘g‘il bola yoki qiz bola tanlovini belgilang.');if(!cleanName(name))throw Error('Ismingizni kiriting.');return {id:randomUUID(),token:randomBytes(24).toString('hex'),name:cleanName(name),gender,score:0,online:true};}
export function createRoom(name,gender){let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));const p=player(name,gender);const room={code,host:p.id,players:[p],phase:'lobby',turn:0,round:1,played:[],task:null,used:[],custom:[],updated:Date.now()};rooms.set(code,room);return {room,p};}
export function view(r){return {...r,players:r.players.map(({token,...p})=>p),custom:undefined,used:undefined,played:undefined};}
export function active(r){return r.players[r.turn];}
export function choose(r,p,type){if(r.phase!=='playing'||active(r)?.id!==p.id||r.task)throw Error('Hozir tanlash mumkin emas.');if(!['truth','dare'].includes(type))throw Error('Noto‘g‘ri tur.');const config=settings();let pool=[...(type==='dare'?[...config.prompts.common,...(config.prompts[p.gender]||[])]:config.prompts.truth),...r.custom.filter(x=>x.type===type).map(x=>x.text)];let available=pool.filter(x=>!r.used.includes(x));if(!available.length){r.used=r.used.filter(x=>!pool.includes(x));available=pool;}const text=available[randomInt(available.length)];r.used.push(text);const duration=type==='dare'?config.dareSeconds:config.truthSeconds;r.task={type,text,duration,points:config.points,deadline:Date.now()+duration*1000};}
export function pickRandom(r){
 const online=r.players.filter(p=>p.online);
 if(!online.length){r.phase='lobby';r.task=null;return;}
 let remaining=online.filter(p=>!(r.played||[]).includes(p.id));
 if(!remaining.length){r.round++;r.played=[];remaining=online;const previous=active(r)?.id;if(online.length>1)remaining=remaining.filter(p=>p.id!==previous);}
 const selected=remaining[randomInt(remaining.length)];r.turn=r.players.findIndex(p=>p.id===selected.id);r.played=[...(r.played||[]),selected.id];
}
export function startRandom(r){r.phase='playing';r.round=1;r.played=[];r.task=null;pickRandom(r);}
export function advance(r,done){if(done)active(r).score+=r.task?.points??settings().points;r.task=null;if(!r.played?.includes(active(r)?.id))r.played=[...(r.played||[]),active(r)?.id];pickRandom(r);}
