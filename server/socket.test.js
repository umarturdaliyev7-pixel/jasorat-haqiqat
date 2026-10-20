import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {io} from 'socket.io-client';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
test('two clients create, join, play, reject out-of-turn actions and finish',async()=>{
 const child=spawn(process.execPath,['server/index.js'],{env:{...process.env,PORT:'3197',DATABASE_URL:''},stdio:['ignore','pipe','pipe']});
 let a,b;
 try{await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('server timeout')),10000);child.stdout.on('data',()=>{clearTimeout(timeout);resolve();});child.once('exit',()=>reject(Error('server exited')));});
 const connect=()=>new Promise((resolve,reject)=>{const s=io('http://localhost:3197',{forceNew:true,reconnection:false});s.on('connect',()=>resolve(s));s.on('connect_error',reject);});
 const call=async(s,action,data={})=>{await delay(140);return new Promise((resolve,reject)=>s.timeout(3000).emit('action',{action,...data},(e,r)=>e?reject(e):resolve(r)));};
 a=await connect();b=await connect();const c=await call(a,'create',{name:'Umar',gender:'male'});assert.equal(c.ok,true);const j=await call(b,'join',{name:'Aziz',gender:'female',code:c.session.code});assert.equal(j.ok,true);let state; b.on('state',r=>state=r);assert.equal((await call(b,'start')).ok,false);assert.equal((await call(a,'start')).ok,true);await delay(50);const first=state.turn;const current=state.players[first].id===c.session.id?a:b;const other=current===a?b:a;assert.equal((await call(other,'choose',{type:'truth'})).ok,false);assert.equal((await call(current,'choose',{type:'truth'})).ok,true);assert.equal((await call(current,'complete')).ok,true);await delay(50);assert.equal(state.players[first].score,10);assert.notEqual(state.turn,first);assert.equal((await call(current,'complete')).ok,false);assert.equal((await call(a,'finish')).ok,true);await delay(50);assert.equal(state.phase,'finished');assert.equal((await call(a,'restart')).ok,true);
 }finally{a?.disconnect();b?.disconnect();child.kill();}
});
