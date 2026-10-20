import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRoom,player,view,choose,advance,rooms} from './game.js';
test('tokens stay private; server enforces turn, score, and nonrepeat prompts',()=>{const {room:r,p}=createRoom('Umar');const q=player('Aziz');r.players.push(q);r.phase='playing';assert.ok(!JSON.stringify(view(r)).includes(p.token));assert.throws(()=>choose(r,q,'truth'));choose(r,p,'truth');let first=r.task.text;assert.throws(()=>choose(r,p,'truth'));advance(r,true);assert.equal(p.score,10);assert.equal(r.turn,1);choose(r,q,'truth');assert.notEqual(r.task.text,first);q.online=false;advance(r,false);assert.equal(r.turn,0);assert.equal(r.round,2);rooms.delete(r.code);});
test('invalid names and prompt types are rejected',()=>{assert.throws(()=>player('  '));const {room:r,p}=createRoom('A');r.phase='playing';assert.throws(()=>choose(r,p,'invalid'));rooms.delete(r.code);});
