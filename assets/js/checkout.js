document.addEventListener("DOMContentLoaded",async()=>{
  const items=KDCart.read();
  const list=$("#checkout-items");
  const form=$("#checkout-form");
  const msg=$("#checkout-msg");
  const btn=$("#submit-order");

  list.innerHTML=items.length
    ?items.map(x=>`<p><strong>${esc(x.name)}</strong><br><small>${x.qty} × ${esc(x.color)}${x.file?` · ${esc(x.file.name)}`:""}</small></p>`).join("")
    :`<p>Korpa je prazna.</p>`;

  const savedFiles=(await Promise.all(items.filter(x=>x.file?.id).map(x=>KDFileStore.get(x.file.id)))).filter(Boolean);
  if(savedFiles.length){
    const transfer=new DataTransfer();
    savedFiles.forEach(file=>transfer.items.add(file));
    $("#order-files").files=transfer.files;
    const fileNote=$("#order-files").closest(".upload").querySelector("small");
    fileNote.textContent=`Automatski preneto iz korpe: ${savedFiles.map(file=>file.name).join(", ")}. Ovde možete dodati ili zameniti fajlove.`;
  }

  form.addEventListener("submit",e=>{
    e.preventDefault();
    if(!items.length){
      msg.innerHTML=`<div class="error-msg">Dodajte bar jedan proizvod u korpu.</div>`;
      return;
    }
    if(Date.now()-(+form.dataset.started)<2500){
      msg.innerHTML=`<div class="error-msg">Molimo proverite podatke i pokušajte ponovo.</div>`;
      return;
    }

    const files=[...$("#order-files").files];
    const totalFileSize=files.reduce((sum,file)=>sum+file.size,0);
    const allowedTypes=new Set(["image/jpeg","image/png","application/pdf","image/svg+xml"]);
    if(files.some(file=>!allowedTypes.has(file.type))||totalFileSize>10*1024*1024){
msg.innerHTML=`<div class="error-msg">Fajlovi moraju biti JPG/JPEG, PNG, PDF ili SVG i ukupno manji od 10 MB.</div>`;
      return;
    }

    const orderId=`KD-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
    const orderDetails=items.map((item,index)=>{
      const sizes=Object.entries(item.sizeQty||{}).map(([size,qty])=>`${size}: ${qty}`).join(", ")||"Nije primenljivo";
      const packageColors=Object.entries(item.packageColors||{}).map(([name,color])=>`${name}: ${color}`).join(", ");
      return [
        `${index+1}. ${item.name}`,
        `Količina: ${item.qty}`,
        `Boja: ${item.color||"Prema dogovoru"}`,
        packageColors?`Boje proizvoda u paketu: ${packageColors}`:"",
        `Veličine: ${sizes}`,
        `Pozicija štampe: ${item.position||"Prema dogovoru"}`,
        `Tekst za štampu: ${item.printText||"Nije unet"}`,
        `Napomena: ${item.note||"Nema"}`,
        `Naziv ranije izabranog fajla: ${item.file?.name||"Nije dodat"}`
      ].filter(Boolean).join("\n");
    }).join("\n\n");

    const hiddenFields={
      "_subject":`Nova porudžbina ${orderId} — Kumovi Debili`,
      "_template":"table",
      "_next":`https://kumovi-debili.pages.dev/success.html?order=${encodeURIComponent(orderId)}`,
      "Broj porudžbine":orderId,
      "Detalji porudžbine":orderDetails
    };
    Object.entries(hiddenFields).forEach(([name,value])=>{
      let input=form.querySelector(`input[data-order-field="${name}"]`);
      if(!input){
        input=document.createElement("input");
        input.type="hidden";
        input.name=name;
        input.dataset.orderField=name;
        form.appendChild(input);
      }
      input.value=value;
    });

    sessionStorage.setItem("kdLastOrder",orderId);
    btn.disabled=true;
    btn.textContent="Šaljem porudžbinu…";
    form.submit();
  });
});
