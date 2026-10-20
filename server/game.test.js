import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRoom,player,view,choose,advance,rooms} from './game.js';
test('tokens stay private; server enforces turn, score, and nonrepeat prompts',()=>{const {room:r,p}=createRoom('Umar','male');const q=player('Aziz','female');r.players.push(q);r.phase='playing';assert.ok(!JSON.stringify(view(r)).includes(p.token));assert.throws(()=>choose(r,q,'truth'));choose(r,p,'truth');let first=r.task.text;assert.throws(()=>choose(r,p,'truth'));advance(r,true);assert.equal(p.score,10);assert.equal(r.turn,1);choose(r,q,'truth');assert.notEqual(r.task.text,first);q.online=false;advance(r,false);assert.equal(r.turn,0);assert.equal(r.round,2);rooms.delete(r.code);});
test('invalid names and prompt types are rejected',()=>{assert.throws(()=>player('  '));const {room:r,p}=createRoom('A','male');r.phase='playing';assert.throws(()=>choose(r,p,'invalid'));rooms.delete(r.code);});
import {genderDares,commonDares} from './prompts.js';
test('gender validation, tailored prompts and 3 minute dare timer',()=>{
 assert.throws(()=>player('A'));assert.throws(()=>player('A','other'));
 for(const gender of ['male','female']){const {room:r,p}=createRoom('A',gender);r.phase='playing';const seen=new Set();for(let i=0;i<commonDares.length+genderDares[gender].length;i++){choose(r,p,'dare');assert.equal(r.task.duration,180);seen.add(r.task.text);r.task=null;}assert.equal(seen.size,commonDares.length+genderDares[gender].length);for(const x of genderDares[gender])assert.ok(seen.has(x));const other=gender==='male'?'female':'male';for(const x of genderDares[other])assert.ok(!seen.has(x));rooms.delete(r.code);}
});
