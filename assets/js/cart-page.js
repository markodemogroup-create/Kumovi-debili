document.addEventListener("DOMContentLoaded",()=>{
 const root=$("#cart-items"),sum=$("#cart-summary");
 function render(){
  const items=KDCart.read();
  if(!items.length){root.innerHTML=`<div class="empty"><h2>Korpa je prazna</h2><p>Nema panike, proizvodi su dva klika daleko.</p><a class="btn lime" href="shop.html">Pogledaj proizvode</a></div>`;sum.innerHTML=`<h2>Pregled upita</h2><p>0 proizvoda</p>`;return}
  root.innerHTML=items.map(x=>`<article class="cart-item">${x.image?`<img src="${x.image}" alt="">`:`<div class="product-media">KD</div>`}<div><h3>${esc(x.name)}</h3><div class="meta">${esc(x.color)} · ${esc(x.position)}</div>${Object.keys(x.packageColors||{}).length?`<p><strong>Boje u paketu:</strong><br>${Object.entries(x.packageColors).map(([k,v])=>`${esc(k)}: ${esc(v)}`).join("<br>")}</p>`:""}<p>${x.printText?`Tekst: <strong>${esc(x.printText)}</strong>`:"Bez unetog teksta"}</p>${x.file?`<div class="cart-file"><strong>Fajl za štampu:</strong><span>${esc(x.file.name)}</span>${x.file.type?.startsWith("image/")?`<img class="cart-file-preview" data-file-preview="${x.file.id}" alt="Pregled fajla ${esc(x.file.name)}">`:""}</div>`:""}${Object.keys(x.sizeQty||{}).length?`<p>Veličine: ${Object.entries(x.sizeQty).map(([k,v])=>`${k}: ${v}`).join(", ")}</p>`:""}<div class="cart-actions"><label>Količina <input data-qty="${x.lineId}" type="number" min="1" value="${x.qty}" style="width:75px"></label></div></div><button class="btn alt" data-remove="${x.lineId}">Ukloni</button></article>`).join("");
  $$("[data-file-preview]").forEach(async img=>{const file=await KDFileStore.get(img.dataset.filePreview);if(file)img.src=URL.createObjectURL(file)});
  const total=items.reduce((s,x)=>s+(+x.qty||1),0);sum.innerHTML=`<h2>Pregled upita</h2><p><strong>${total}</strong> komada / članova</p><p>Cena se formira prema količini, proizvodima i vrsti personalizacije.</p><a class="btn" href="checkout.html">Nastavi na podatke →</a>`;
  $$("[data-remove]").forEach(b=>b.onclick=async()=>{const item=KDCart.read().find(x=>x.lineId===b.dataset.remove);if(item?.file?.id)await KDFileStore.remove(item.file.id);KDCart.remove(b.dataset.remove);render()});$$("[data-qty]").forEach(i=>i.onchange=()=>{KDCart.update(i.dataset.qty,{qty:Math.max(1,+i.value)});render()})
 }
 render();
});
