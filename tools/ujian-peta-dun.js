/* Nusa Politik — tools/ujian-peta-dun.js (v14.25): Wilayah Persekutuan dipisahkan pada peta (KL, Putrajaya, Labuan) dan aras DUN
   (Malaysia › Negeri › Bahagian › DUN › Cawangan) dengan peta satu DUN. Data peta: data/dap-malaysia.csv (ada WP). Guna: node tools/ujian-peta-dun.js */
const fs=require('fs'),path=require('path'),http=require('http');const PW=require('playwright');const ROOT=path.join(__dirname,'..');const P=require('./persekitaran');
const g=P.muat();P.daftar({nama:'Uji Peta DUN',umur:40});const BEKAL={};g.localStorage._peta.forEach((v,k)=>{BEKAL[k]=v;});BEKAL.nusaLang='EN';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.csv':'text/csv'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]),f=path.join(ROOT,u==='/'?'index.html':u);if(!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>srv.listen(0,r));const base='http://127.0.0.1:'+srv.address().port;const br=await PW.chromium.launch();
const pg=await br.newPage({viewport:{width:1280,height:1000}});await pg.route('**/*',rt=>rt.request().url().startsWith(base)?rt.continue():rt.abort());
await pg.addInitScript(d=>{if(sessionStorage.getItem('__b'))return;sessionStorage.setItem('__b','1');Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));},BEKAL);
await pg.goto(base+'/dashboard.html');await pg.waitForSelector('#kandungan:not([hidden])');await pg.evaluate(()=>{try{MyPolitikTutorial.skip()}catch(e){}});
await pg.addStyleTag({content:'.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}'});
for(let i=0;i<4;i++){const b=await pg.$('#modal.is-open button');if(!b)break;await b.click();await pg.waitForTimeout(300);}
await pg.evaluate(()=>NusaUI.gotoTab('peta'));await pg.waitForTimeout(3000);
const err=[];pg.on('pageerror',e=>err.push(e.message));const gagal=[];const semak=(ok,m)=>{if(!ok){gagal.push(m);}};
await pg.evaluate(async()=>{const t=await (await fetch('data/dap-malaysia.csv')).text(),D=MyPolitikData,h=document.getElementById('peta-host'),i=MyPolitikMap.getInstance();if(i){i.destroy();}await MyPolitikMap.mount(h,{data:D.rowsToHierarchy(D.parseCSV(t))});});await pg.waitForTimeout(2500);
const S=()=>pg.evaluate(()=>{const s=MyPolitikMap.getInstance().getState();s.crumb=Array.from(document.querySelectorAll('#peta-host .mpm-crumb-b')).map(e=>e.textContent.trim());s.poli=document.querySelectorAll('#peta-host .mpm-poli[data-id]').length;return s;});
await pg.click('#peta-host [data-act="crumb"][data-v="negeri"]');await pg.waitForTimeout(1500);
const ids=await pg.$$eval('#peta-host .mpm-poli[data-id]',x=>[...new Set(x.map(e=>e.getAttribute('data-id')))]);
semak(['wp@14','wp@15','wp@16'].every(k=>ids.indexOf(k)>=0)&&ids.indexOf('wp')<0,'WP tidak dipisahkan kepada tiga wilayah: '+ids.join(','));
semak(await pg.$$eval('.mpm-inset .mpm-poli',x=>x.length)===2,'sisipan zum KL + Putrajaya tiada');
await pg.click('.mpm-inset .mpm-poli[data-id="wp@14"]');await pg.waitForTimeout(500);
const pan=await pg.$eval('#peta-host',e=>e.innerText);semak(/Kuala Lumpur/i.test(pan)&&/are one state/.test(pan),'panel wilayah KL salah: '+pan.slice(0,200));
await pg.click('#peta-host [data-act="drill"]');await pg.waitForTimeout(1500);let s=await S();
semak(s.mode==='bahagian'&&s.negeriTapis==='wp'&&s.wp==='14'&&s.poli===11&&s.crumb[1]==='W.P. Kuala Lumpur','zum masuk KL: '+JSON.stringify([s.mode,s.wp,s.poli,s.crumb]));
await pg.evaluate(()=>{const i=MyPolitikMap.getInstance(),M=i.getModel();i.pilih('bahagian',M.bahagian.filter(b=>b.negeri.id==='melaka'&&/Kota Melaka/i.test(b.nama))[0].id);});await pg.waitForTimeout(600);
await pg.click('#peta-host [data-act="drill"]');await pg.waitForTimeout(2500);s=await S();
semak(s.mode==='dun'&&s.poli===5&&/P\.138/.test(s.crumb[2]||''),'zum masuk bahagian -> DUN: '+JSON.stringify([s.mode,s.poli,s.crumb]));
const dId=await pg.$$eval('#peta-host .mpm-poli[data-tahap="dun"]',x=>x.map(e=>e.getAttribute('data-id')).sort()[1]);
await pg.dblclick('#peta-host .mpm-poli[data-id="'+dId+'"]',{force:true});await pg.waitForTimeout(3000);s=await S();
semak(s.mode==='pdm'&&s.pdmDun===dId&&s.poli>3&&/^N\.\d\d /.test(s.crumb[3]||''),'DUN -> peta DUN sendiri: '+JSON.stringify([s.mode,s.pdmDun,dId,s.poli,s.crumb]));
semak(await pg.$$eval('#peta-host [data-act="dunnav"]',x=>x.map(e=>e.textContent).join('|'))==='◀ Previous DUN|Next DUN ▶','butang DUN sebelum/seterusnya tiada (EN)');
await pg.click('#peta-host [data-act="dunnav"]:not([disabled])');await pg.waitForTimeout(2500);const s2=await S();semak(s2.mode==='pdm'&&s2.pdmDun&&s2.pdmDun!==dId,'DUN seterusnya gagal');
await pg.click('#peta-host [data-act="crumb"][data-v="dunbhg"]');await pg.waitForTimeout(2000);s=await S();semak(s.mode==='dun'&&s.dipilih&&s.dipilih.id===s2.pdmDun,'laluan kembali ke DUN bahagian gagal');
semak(!err.length,'Ralat JavaScript: '+err.join(' | '));
await br.close();srv.close();if(gagal.length){console.log('GAGAL:\n - '+gagal.join('\n - '));process.exit(1);}else{console.log('Ujian peta WP dan DUN lulus.');}})();
