(function(){
const KEY="kumoviDebiliCartV1";
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return[]}}
function write(items){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event("kd-cart"))}
function add(item){const items=read();items.push({...item,lineId:crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()});write(items)}
function remove(id){write(read().filter(x=>x.lineId!==id))}
function update(id,patch){write(read().map(x=>x.lineId===id?{...x,...patch}:x))}
window.KDCart={read,write,add,remove,update};
})();
