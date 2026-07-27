(function(){
const KEY="kumoviDebiliCartV1";
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function write(items){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event("kd-cart"))}
function add(item){const items=read();items.push({...item,lineId:crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()});write(items)}
function remove(id){write(read().filter(x=>x.lineId!==id))}
function update(id,patch){write(read().map(x=>x.lineId===id?{...x,...patch}:x))}
window.KDCart={read,write,add,remove,update};
})();

(function(){
 const DB_NAME="kumoviDebiliFilesV1",STORE="files";
 function db(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:"id"});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
 async function save(file){const id=crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random();const database=await db();await new Promise((resolve,reject)=>{const tx=database.transaction(STORE,"readwrite");tx.objectStore(STORE).put({id,file});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});database.close();return{id,name:file.name,type:file.type,size:file.size}}
 async function get(id){if(!id)return null;const database=await db(),result=await new Promise((resolve,reject)=>{const req=database.transaction(STORE).objectStore(STORE).get(id);req.onsuccess=()=>resolve(req.result?.file||null);req.onerror=()=>reject(req.error)});database.close();return result}
 async function remove(id){if(!id)return;const database=await db();await new Promise((resolve,reject)=>{const tx=database.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});database.close()}
 window.KDFileStore={save,get,remove};
})();
