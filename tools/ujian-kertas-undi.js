/* Nusa Politik — tools/ujian-kertas-undi.js (v14.27): kertas undi dalam mesyuarat: satu jawatan satu halaman, Seterusnya, semak, masukkan undi,
   tutup mesyuarat dan ringkasan "Undi Anda" (EN). Guna: node tools/ujian-kertas-undi.js */
const fs=require('fs'),path=require('path'),http=require('http');const PW=require('playwright');const ROOT=path.join(__dirname,'..');const P=require('./persekitaran');
const g=P.muat();const E=g.MyPolitikElection,K=g.MyPolitikCalendar;P.daftar({nama:'Uji Undi',umur:40,tahunAhli:10});let t=2026;while(!E.adalahTahunPemilihan(t)){t++;}
const bln=K.getTetingkap('cawangan',1).mula;P.tetap({tahun:t,bulan:bln,ip:900,ap:30,myr:99999,jawatanList:[{kod:'ajk_cawangan',jawatan:'AJK Cawangan',peringkat:'cawangan',kumpulan:'ajk',pangkat:1,tahun:t-3}]});
const rd=E.daftarBertanding('naib_ketua_cawangan');if(!rd.ok){console.log('GAGAL: daftar '+rd.ralat);process.exit(1);}
const BEKAL={};g.localStorage._peta.forEach((v,k)=>{BEKAL[k]=v;});BEKAL.nusaLang=process.env.BM?'BM':'EN';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.csv':'text/csv'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]),f=path.join(ROOT,u==='/'?'index.html':u);if(!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>srv.listen(0,r));const base='http://127.0.0.1:'+srv.address().port;const br=await PW.chromium.launch();
const pg=await br.newPage({viewport:{width:420,height:900}});await pg.route('**/*',rt=>rt.request().url().startsWith(base)?rt.continue():rt.abort());
await pg.addInitScript(d=>{if(sessionStorage.getItem('__b'))return;sessionStorage.setItem('__b','1');Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));},BEKAL);
const err=[];pg.on('pageerror',e=>err.push(e.message));const gagal=[];const semak=(ok,m)=>{if(!ok){gagal.push(m);}};
await pg.goto(base+'/dashboard.html');await pg.waitForSelector('#kandungan:not([hidden])');await pg.evaluate(()=>{try{MyPolitikTutorial.skip()}catch(e){}});
await pg.addStyleTag({content:'.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}'});
for(let i=0;i<4;i++){const b=await pg.$('#modal.is-open button');if(!b)break;await b.click();await pg.waitForTimeout(300);}
await pg.evaluate(()=>NusaUI.gotoTab('mesyuarat'));await pg.waitForTimeout(600);
await pg.evaluate(()=>{const b=document.querySelector('[data-act="mula"][data-lvl="cawangan"]');if(b){b.click();}});await pg.waitForTimeout(700);
const KU=await pg.evaluate(()=>MyPolitikElection.kertasUndi('cawangan'));semak(KU.length>=3,'kertas undi: '+KU.length+' jawatan');
await pg.click('[data-act="ku-buka"]');await pg.waitForTimeout(300);
for(let i=0;i<KU.length;i++){
  const tj=await pg.$eval('.ku h3',e=>e.textContent);const nC=await pg.$$eval('.ku-calon',x=>x.length);semak(nC===KU[i].calon.length,'halaman '+i+' calon '+nC);
  if(KU[i].didaftar){semak(await pg.$$eval('.ku-calon.is-anda',x=>x.length)===1,'nama anda tiada dalam '+tj);await pg.click('.ku-calon.is-anda');}else{await pg.click('.ku-calon >> nth=0');}
  semak(await pg.$$eval('.ku-calon.is-on',x=>x.length)===1,'pilihan tidak ditanda: '+tj);
  if(i===1&&process.env.SHOT){const el=await pg.$('.ku');await el.screenshot({path:process.env.SHOT});}
  await pg.click('[data-act="ku-nav"][data-v="1"]');await pg.waitForTimeout(150);
}
if(process.env.DBG){console.log(await pg.$eval('.ku',e=>e.outerHTML.slice(0,1500)));}const semakT=await pg.$eval('.ku',e=>e.textContent);semak(/Review Ballot|Semak Kertas Undi/.test(semakT),'halaman semak tiada: '+semakT.slice(0,120));
await pg.click('[data-act="ku-hantar"]');await pg.waitForTimeout(400);semak(await pg.evaluate(()=>!!MyPolitikElection.kertasDihantar('cawangan')),'undi tidak disimpan');
await pg.evaluate(()=>{document.querySelector('[data-act="tutup"][data-lvl="cawangan"]').click();});await pg.waitForTimeout(400);
await pg.evaluate(()=>{const b=Array.from(document.querySelectorAll('#modal.is-open button')).pop();if(b){b.click();}});await pg.waitForTimeout(1200);
if(process.env.DBG){console.log(JSON.stringify(await pg.evaluate(()=>{const p=MyPolitikSave.loadPlayer();return {m:(p.mesyuarat||{}).cawangan&&p.mesyuarat.cawangan.ringkasan&&p.mesyuarat.cawangan.ringkasan.kertas};})).slice(0,700));}const ring=await pg.evaluate(()=>(document.querySelector('#modal.is-open')||{}).textContent||'');
semak(/Your Votes|Undi Anda/.test(ring)&&/(CHOICE WON|CHOICE LOST|PILIHAN MENANG|PILIHAN KALAH)/.test(ring),'ringkasan Undi Anda tiada: '+ring.slice(0,300));
if(!process.env.BM){const bm=ring.match(/(Pengundian|Kertas|pilih sehingga|Berkecuali|Pemenang|Undi Anda)/);semak(!bm,'BM bocor dalam ringkasan EN: '+(bm&&bm[0]));}
semak(!err.length,'Ralat JavaScript: '+err.join(' | '));
await br.close();srv.close();if(gagal.length){console.log('GAGAL:\n - '+gagal.join('\n - '));process.exit(1);}else{console.log('Ujian kertas undi lulus.');}})();
