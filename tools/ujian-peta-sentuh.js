/* Nusa Politik — tools/ujian-peta-sentuh.js (v14.24): ujian pelayar telefon: seret satu jari dan zum cubit pada tab Peta, ketik masih memilih kawasan. Guna: node tools/ujian-peta-sentuh.js */
const fs=require('fs'),path=require('path'),http=require('http');const PW=require('playwright');const ROOT=path.join(__dirname,'..');const P=require('./persekitaran');
const g=P.muat();P.daftar({nama:'Uji Sentuh',umur:40});const BEKAL={};g.localStorage._peta.forEach((v,k)=>{BEKAL[k]=v;});BEKAL.nusaLang='BM';
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.csv':'text/csv'};
const srv=http.createServer((q,r)=>{const u=decodeURIComponent(q.url.split('?')[0]),f=path.join(ROOT,u==='/'?'index.html':u);if(!fs.existsSync(f)||!fs.statSync(f).isFile()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);});
(async()=>{await new Promise(r=>srv.listen(0,r));const base='http://127.0.0.1:'+srv.address().port;const br=await PW.chromium.launch();
const ctx=await br.newContext({...PW.devices['Pixel 5']});const pg=await ctx.newPage();await pg.route('**/*',rt=>rt.request().url().startsWith(base)?rt.continue():rt.abort());
await pg.addInitScript(d=>{if(sessionStorage.getItem('__b'))return;sessionStorage.setItem('__b','1');Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));},BEKAL);
await pg.goto(base+'/dashboard.html');await pg.waitForSelector('#kandungan:not([hidden])');await pg.evaluate(()=>{try{MyPolitikTutorial.skip()}catch(e){}});
await pg.addStyleTag({content:'.tut-kad,.tut-blok,.tut-sorot,.tut-fab,#mpa-bar,.toast-stack{display:none!important}'});
for(let i=0;i<4;i++){const b=await pg.$('#modal.is-open button');if(!b)break;await b.click();await pg.waitForTimeout(300);}
await pg.evaluate(()=>NusaUI.gotoTab('peta'));await pg.waitForTimeout(3000);
const svg=await pg.$('#peta-host svg.mpm-peta');await svg.scrollIntoViewIfNeeded();const bx=await svg.boundingBox();const vb0=await svg.getAttribute('viewBox');
const cdp=await ctx.newCDPSession(pg);const x=bx.x+bx.width/2,y=bx.y+bx.height/2;
const t=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
await t('touchStart',[{x,y,id:1}]);for(let i=1;i<=8;i++){await t('touchMove',[{x:x-i*12,y:y-i*6,id:1}]);await pg.waitForTimeout(20);}await t('touchEnd',[]);await pg.waitForTimeout(200);
const vb1=await svg.getAttribute('viewBox');const gagal=[];if(vb0===vb1){gagal.push('seret satu jari tidak mengalihkan peta');}
await t('touchStart',[{x:x-40,y,id:1},{x:x+40,y,id:2}]);for(let i=1;i<=6;i++){await t('touchMove',[{x:x-40-i*12,y,id:1},{x:x+40+i*12,y,id:2}]);await pg.waitForTimeout(20);}await t('touchEnd',[]);await pg.waitForTimeout(200);
const vb2=await svg.getAttribute('viewBox');if(!((+vb2.split(' ')[2])<(+vb1.split(' ')[2]))){gagal.push('zum cubit tidak berfungsi');}
await pg.touchscreen.tap(x,y);await pg.waitForTimeout(400);const sel=await pg.$eval('#peta-host',h=>!!h.querySelector('.is-pilih, [aria-pressed="true"], .mpm-poli.is-on'));if(!sel){gagal.push('ketik tidak memilih kawasan');}
await br.close();srv.close();if(gagal.length){console.log('GAGAL:\n - '+gagal.join('\n - '));process.exit(1);}else{console.log('Ujian sentuhan peta lulus.');}})();
