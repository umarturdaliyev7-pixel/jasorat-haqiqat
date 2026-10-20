import fs from 'node:fs';
import path from 'node:path';
import {prompts,commonDares,genderDares} from './prompts.js';
export const dataDir=process.env.DATA_DIR||path.resolve('data');
const defaults={revision:0,title:'Jasorat yoki Haqiqat',headline:'Bir tanlov.',subtitle:'Mingta xotira.',theme:{background:'#0c0a18',panel:'#201a30',accent:'#bda2ff',text:'#f6f4ff',fontSize:16,radius:22},truthSeconds:60,dareSeconds:180,points:10,prompts:{truth:prompts.truth,common:commonDares,male:genderDares.male,female:genderDares.female}};
export function validateSettings(v){
 if(!v||typeof v!=='object')throw Error('Sozlamalar noto‘g‘ri.');
 const out={revision:0};
 for(const key of ['title','headline','subtitle']){if(typeof v[key]!=='string'||!v[key].trim()||v[key].length>100)throw Error('Sarlavha 1–100 belgi bo‘lsin.');out[key]=v[key].trim();}
 out.theme={};for(const key of ['background','panel','accent','text']){if(!/^#[0-9a-f]{6}$/i.test(v.theme?.[key]))throw Error('Rang HEX formatida bo‘lsin.');out.theme[key]=v.theme[key];}
 for(const [k,min,max]of [['fontSize',12,24],['radius',0,40]]){if(!Number.isInteger(v.theme[k])||v.theme[k]<min||v.theme[k]>max)throw Error('Uslub qiymati chegaradan tashqarida.');out.theme[k]=v.theme[k];}
 for(const [k,min,max]of [['truthSeconds',15,900],['dareSeconds',15,900],['points',1,100]]){if(!Number.isInteger(v[k])||v[k]<min||v[k]>max)throw Error('Vaqt 15–900 soniya, ball 1–100 bo‘lsin.');out[k]=v[k];}
 out.prompts={};for(const k of ['truth','common','male','female']){const list=v.prompts?.[k];if(!Array.isArray(list)||list.length>200||!list.every(x=>typeof x==='string'&&x.trim()&&x.length<=400))throw Error('Har bir bo‘limda ko‘pi bilan 200 ta, 1–400 belgili matn bo‘lsin.');out.prompts[k]=[...new Set(list.map(x=>x.trim()))];}
 if(!out.prompts.truth.length||!out.prompts.common.length)throw Error('Kamida bitta haqiqat va umumiy jasorat sharti qolsin.');return out;
}
export function atomicWrite(filename,value){fs.mkdirSync(dataDir,{recursive:true});const target=path.join(dataDir,filename);fs.writeFileSync(target+'.tmp',JSON.stringify(value,null,2),{mode:0o600});fs.renameSync(target+'.tmp',target);}
let current=structuredClone(defaults);
try{const stored=JSON.parse(fs.readFileSync(path.join(dataDir,'settings.json'),'utf8'));current={...validateSettings(stored),revision:Number(stored.revision)||0};}catch(e){if(e.code!=='ENOENT')throw e;}
export const settings=()=>structuredClone(current);
export function saveSettings(value){if(value.revision!==current.revision)throw Error('Sozlamalar boshqa oynada o‘zgargan. Sahifani yangilang.');const next=validateSettings(value);next.revision=current.revision+1;atomicWrite('settings.json',next);current=next;return settings();}
