const ALLOWED_TYPES=new Set(["image/jpeg","image/png","application/pdf","image/svg+xml"]);
const MAX_FILE_SIZE=20*1024*1024;
const clean=v=>String(v??"").replace(/[<>]/g,"").replace(/[\u0000-\u001F\u007F]/g," ").trim().slice(0,2000);
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
function safeName(name){return clean(name).replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,120)}
function validOrder(body){
 if(!body||typeof body!=="object"||!Array.isArray(body.items)||!body.items.length)return "Porudžbina je prazna.";
 const c=body.customer||{};if(!clean(c.name)||!clean(c.phone)||!clean(c.email)||!clean(c.city)||!clean(c.address)||c.consent!=="yes")return "Nedostaju obavezni podaci.";
 if(c.website)return "Zahtev nije prihvaćen.";
 return "";
}
export default{
 async fetch(request,env){
  const url=new URL(request.url);
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":env.ALLOWED_ORIGIN||url.origin,"access-control-allow-methods":"POST,OPTIONS","access-control-allow-headers":"content-type"}});
  if(request.method!=="POST")return json({error:"Metod nije dozvoljen."},405);
  const origin=request.headers.get("origin");if(env.ALLOWED_ORIGIN&&origin!==env.ALLOWED_ORIGIN)return json({error:"Nedozvoljeno poreklo zahteva."},403);
  if(url.pathname==="/api/upload"){
   const form=await request.formData(),file=form.get("file"),orderId=safeName(form.get("orderId")||"draft");
   if(!(file instanceof File)||!ALLOWED_TYPES.has(file.type)||file.size>MAX_FILE_SIZE)return json({error:"Nedozvoljen tip ili veličina fajla."},400);
   const name=safeName(file.name);if(/\.(exe|bat|cmd|com|msi|js|jar|ps1|scr|sh)$/i.test(name))return json({error:"Opasan tip fajla."},400);
   if(!env.DESIGNS)return json({test:true,name,message:"R2 nije povezan; fajl je samo validiran."});
   const key=`orders/${orderId}/${crypto.randomUUID()}-${name}`;await env.DESIGNS.put(key,file.stream(),{httpMetadata:{contentType:file.type},customMetadata:{originalName:name}});
   return json({name,key});
  }
  if(url.pathname==="/api/order"){
   const size=Number(request.headers.get("content-length")||0);if(size>1024*1024)return json({error:"Zahtev je prevelik."},413);
   let body;try{body=await request.json()}catch{return json({error:"Neispravan zahtev."},400)}
   const error=validOrder(body);if(error)return json({error},400);
   const order={orderId:clean(body.orderId),createdAt:new Date().toISOString(),customer:Object.fromEntries(Object.entries(body.customer).map(([k,v])=>[k,clean(v)])),items:body.items.slice(0,100).map(i=>({name:clean(i.name),qty:Math.max(1,Math.min(500,Number(i.qty)||1)),color:clean(i.color),position:clean(i.position),printText:clean(i.printText),note:clean(i.note),sizeQty:i.sizeQty||{},file:i.file?{name:safeName(i.file.name),key:clean(i.file.key)}:null}))};
   if(env.TEST_MODE==="true"||!env.EMAIL_API_URL)return json({ok:true,test:true,order});
   const resp=await fetch(env.EMAIL_API_URL,{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${env.EMAIL_API_KEY}`},body:JSON.stringify({to:env.ORDER_EMAIL,subject:`Nova porudžbina ${order.orderId}`,order})});
   if(!resp.ok)return json({error:"Email servis trenutno nije dostupan."},502);
   return json({ok:true,orderId:order.orderId});
  }
  return json({error:"Ruta nije pronađena."},404);
 }
};
