import {randomBytes,randomInt,randomUUID} from 'node:crypto';
import {prompts} from './prompts.js';
export const rooms=new Map();
export const cleanName=v=>typeof v==='string'?v.trim().slice(0,24):'';
export function player(name){if(!cleanName(name))throw Error('Ismingizni kiriting.');return {id:randomUUID(),token:randomBytes(24).toString('hex'),name:cleanName(name),score:0,online:true};}
export function createRoom(name){let code;do{code=randomBytes(3).toString('hex').toUpperCase();}while(rooms.has(code));const p=player(name);const room={code,host:p.id,players:[p],phase:'lobby',turn:0,round:1,task:null,used:[],custom:[],updated:Date.now()};rooms.set(code,room);return {room,p};}
export function view(r){return {...r,players:r.players.map(({token,...p})=>p),custom:undefined,used:undefined};}
export function active(r){return r.players[r.turn];}
export function choose(r,p,type){if(r.phase!=='playing'||active(r)?.id!==p.id||r.task)throw Error('Hozir tanlash mumkin emas.');if(!['truth','dare'].includes(type))throw Error('Noto‘g‘ri tur.');let pool=[...prompts[type],...r.custom.filter(x=>x.type===type).map(x=>x.text)];let available=pool.filter(x=>!r.used.includes(x));if(!available.length){r.used=r.used.filter(x=>!pool.includes(x));available=pool;}const text=available[randomInt(available.length)];r.used.push(text);r.task={type,text,deadline:Date.now()+60000};}
export function advance(r,done){if(done)active(r).score+=10;r.task=null;for(let i=0;i<r.players.length;i++){r.turn=(r.turn+1)%r.players.length;if(r.turn===0)r.round++;if(active(r).online)return;}r.phase='lobby';}
