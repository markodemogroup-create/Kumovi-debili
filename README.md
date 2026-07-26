# Kumovi Debili — početna verzija

Samostalan responsive sajt i mala prodavnica u čistom HTML-u, CSS-u i JavaScriptu.

## Lokalno otvaranje

Za brz pregled možete otvoriti `index.html` dvoklikom. Za test slanja obrasca pokrenite lokalni web server u ovoj fascikli, na primer:

```text
python -m http.server 8080
```

Zatim otvorite `http://localhost:8080`.

## Gde se menjaju proizvodi

Svi nazivi, opisi, modeli, fotografije, boje i oznake cena nalaze se u `assets/js/products.js`. Model majice i rashladne torbe su namerno označeni za naknadnu potvrdu. Prodajne cene nisu izmišljene; svuda je prikazano „TRI PRASETA GROK“.

Fotografije i podaci za TASOS 56.023, PIGNA MAXI 44.185.91, CALABRIA 34.730, ARLO 54.032, SONDER 32.363 i ADLER 41.254 preuzeti su iz postojećeg DemoShop kataloga.

Kolekcija „Poslednji preživeli“ je primer štampe napravljen od dve dostavljene fotografije. Mockup i originali se nalaze u `assets/images/`, pa se naziv ili fotografije kasnije lako mogu zameniti.

## Korpa i test režim

Korpa se čuva u `localStorage` i ostaje nakon osvežavanja stranice. Naziv i osnovni podaci izabranog fajla vezani su za konkretnu stavku u korpi. Zbog ograničenja browser skladišta, stvarni sadržaj fajla se ne čuva u `localStorage`; u produkciji se fajl šalje direktno na Worker i R2.

Kada se sajt otvori lokalno, checkout radi kao demonstracija: generiše broj upita i vodi na stranicu potvrde bez stvarnog slanja emaila.

## Cloudflare Worker, R2 i email

Primer bezbednog Workera nalazi se u `worker/worker.js`, a primer podešavanja u `worker/wrangler.toml.example`.

Za produkciju je potrebno:

1. napraviti privatni R2 bucket i povezati ga kao `DESIGNS`;
2. podesiti `ALLOWED_ORIGIN` na pravi domen;
3. izabrati email servis i podesiti `EMAIL_API_URL`;
4. dodati `EMAIL_API_KEY` kao Cloudflare secret;
5. podesiti `ORDER_EMAIL`;
6. promeniti `TEST_MODE` na `false`;
7. povezati frontend upload sa `/api/upload` i sačuvani R2 ključ poslati uz `/api/order`;
8. generisati vremenski ograničene linkove za preuzimanje fajlova;
9. po potrebi dodati Turnstile i ograničenje broja zahteva po IP adresi.

Nikakve lozinke ni API ključevi ne pripadaju frontend kodu.

## Pre objave obavezno

- uneti poslovni email, telefon, adresu i podatke firme;
- potvrditi tačan model majice i rashladne torbe;
- uneti stvarne prodajne cene ili zadržati sistem „TRI PRASETA GROK“;
- pravno pregledati politiku privatnosti i uslove poručivanja;
- proveriti dozvole za korišćenje fotografija iz DemoShop kataloga.

