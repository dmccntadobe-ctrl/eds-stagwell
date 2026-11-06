import fs from 'fs'; import crypto from 'crypto';
const D = (process.env.SRC_DIR || './source').replace(/[\/]?$/, '/');
const files=['Stagwell _ Meet Mark - Stagwell.html','Stagwell _ Our Network - Stagwell.html','Stagwell _ About Us - Stagwell.html','Stagwell _ Transforming Marketing (1).html'];
fs.mkdirSync('media',{recursive:true});
const seen={};
files.forEach((f,i)=>{
  const h=fs.readFileSync(D+f,'utf8');
  const re=/data:(image\/[a-z+\-]+|video\/mp4);base64,([A-Za-z0-9+\/=]+)/g; let m;
  while((m=re.exec(h))){
    const buf=Buffer.from(m[2],'base64'); const hash=crypto.createHash('sha1').update(buf).digest('hex').slice(0,12);
    const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/svg+xml':'svg','image/gif':'gif','video/mp4':'mp4','image/x-icon':'ico','image/vnd.microsoft.icon':'ico'}[m[1]]||'bin';
    const n=`${hash}.${ext}`; if(!seen[n]){seen[n]={size:buf.length,pages:new Set()};fs.writeFileSync('media/'+n,buf);} seen[n].pages.add(i+1);
  }
});
for(const [n,v] of Object.entries(seen)) console.log(n,v.size,[...v.pages].join(','));
