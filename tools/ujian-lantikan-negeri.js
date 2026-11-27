/* Nusa Politik — tools/ujian-lantikan-negeri.js (v14.30): Ketua Pemuda Pusat melantik Ketua Pemuda Negeri dalam satu senarai (tab Pemilihan),
   tanpa pop-up berantai; sahkan sekali; EN. Guna: node tools/ujian-lantikan-negeri.js */
const fs=require('fs'),path=require('path'),http=require('http');const PW=require('playwright');const ROOT=path.join(__dirname,'..');const P=require('./persekitaran');
const g=P.muat();const E=g.MyPolitikElection,N=g.MyPolitikNegeri;P.daftar({nama:'Uji Lantik',umur:30,sayap:'pemuda',tahunAhli:10});let t=2026;while(!E.adalahTahunPemilihan(t)){t++;}
P.tetap({tahun:t,bulan:9,jawatanList:[{kod:'sayap_pusat_pemuda',jawatan:'Ketua Pemuda',peringkat:'pusat',kumpulan:'sayap',sayap:'pemuda',pangkat:9,tahun:t}]});N.sayap.prosesBulan({});
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
await pg.evaluate(()=>NusaUI.gotoTab('pemilihan'));await pg.waitForTimeout(700);
const kad=await pg.$('.pp-negeri[data-b="sayap"] .ng-senarai');semak(!!kad,'kad senarai lantikan tiada');
const nSel=await pg.$$eval('.pp-negeri[data-b="sayap"] select[data-ngp]',x=>x.length);semak(nSel===13,'13 negeri (UMNO tanpa Sarawak): '+nSel);
semak(!(await pg.$('#modal.is-open')),'pop-up masih dibuka');
if(process.env.SHOT){await kad.screenshot({path:process.env.SHOT});}
const teks=await pg.$eval('.pp-negeri[data-b="sayap"]',e=>e.textContent);
if(!process.env.BM){const bm=teks.match(/(Lantikan|Calon terbaik|Sahkan|Pengganti|sudah dipilih|automatik)/);semak(!bm,'BM bocor dalam EN: '+(bm&&bm[0])+' :: '+teks.slice(0,200));}
const pil=await pg.evaluate(()=>{const s=document.querySelectorAll('.pp-negeri[data-b="sayap"] select[data-ngp]')[2];s.value=s.options[s.options.length-1].value;return {k:s.getAttribute('data-ngp'),v:s.value};});
await pg.click('.pp-negeri[data-b="sayap"] [data-act="negeri-sahkan"]');await pg.waitForTimeout(600);
const hasil=await pg.evaluate((pil)=>{const p=MyPolitikSave.loadPlayer();return {baki:!!MyPolitikNegeri.sayap.senaraiLantikan(p),ada:Object.keys((p.negeriSayapLain||{}).ada||{}).length,pilih:((p.negeriSayapLain||{}).ada||{})[pil.k.slice(2)]};},pil);
semak(!hasil.baki&&hasil.ada===12,'lantikan tidak disahkan: '+JSON.stringify(hasil));semak(hasil.pilih&&hasil.pilih.id===pil.v,'pilihan ditukar tidak disimpan');
semak(!err.length,'Ralat JavaScript: '+err.join(' | '));
await br.close();srv.close();if(gagal.length){console.log('GAGAL:\n - '+gagal.join('\n - '));process.exit(1);}else{console.log('Ujian lantikan negeri lulus.');}})();
