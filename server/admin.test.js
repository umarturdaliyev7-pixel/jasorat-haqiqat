import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
test('admin authentication, validation, persistence, concurrency and password rotation',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'jh-admin-'));let child;
 const start=async()=>{child=spawn(process.execPath,['server/index.js'],{env:{...process.env,PORT:'3198',DATABASE_URL:'',DATA_DIR:dir,ADMIN_PASSWORD:'Test-Admin-Password-2026',ADMIN_SECRET:'test-secret-long-and-private',NODE_ENV:'test'},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('server timeout')),8000);child.stdout.once('data',()=>{clearTimeout(t);resolve();});child.once('exit',()=>reject(Error('server exit')));});};
 const stop=async()=>{if(child){const exited=new Promise(r=>child.once('exit',r));child.kill();await exited;child=null;}};
 const req=async(url,method='GET',body,cookie)=>fetch('http://localhost:3198'+url,{method,headers:{'Content-Type':'application/json','X-Admin-Request':'1',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});
 try{await start();assert.equal((await req('/api/admin/settings')).status,401);assert.equal((await req('/api/admin/login','POST',{password:'wrong'})).status,401);let login=await req('/api/admin/login','POST',{password:'Test-Admin-Password-2026'});assert.equal(login.status,200);let cookie=login.headers.get('set-cookie').split(';')[0];let config=await(await req('/api/admin/settings','GET',null,cookie)).json();const original=structuredClone(config);
 assert.equal((await req('/api/admin/settings','PUT',{...config,points:999},cookie)).status,400);config.points=17;config.dareSeconds=240;config.theme.accent='#ff8844';config.prompts.truth=['Admin savoli'];let res=await req('/api/admin/settings','PUT',config,cookie);assert.equal(res.status,200);config=await res.json();assert.equal((await req('/api/admin/settings','PUT',original,cookie)).status,400);let publicConfig=await(await req('/api/settings')).json();assert.equal(publicConfig.points,17);assert.equal(publicConfig.prompts,undefined);
 assert.equal((await fetch('http://localhost:3198/api/admin/settings',{method:'PUT',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(config)})).status,403);
 await stop();await start();let restored=await(await req('/api/admin/settings','GET',null,cookie)).json();assert.equal(restored.points,17);assert.deepEqual(restored.prompts.truth,['Admin savoli']);res=await req('/api/admin/password','POST',{password:'New-Admin-Password-2026'},cookie);assert.equal(res.status,200);assert.equal((await req('/api/admin/settings','GET',null,cookie)).status,401);assert.equal((await req('/api/admin/login','POST',{password:'Test-Admin-Password-2026'})).status,401);assert.equal((await req('/api/admin/login','POST',{password:'New-Admin-Password-2026'})).status,200);
 }finally{await stop();await rm(dir,{recursive:true,force:true});}
});
