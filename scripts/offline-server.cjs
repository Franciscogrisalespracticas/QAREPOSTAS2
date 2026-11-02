const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const mimes={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.mp4':'video/mp4'};
http.createServer((req,res)=>{
 const url=new URL(req.url||'/', 'http://localhost');let p=decodeURIComponent(url.pathname);
 if(p==='/'||p==='/index.html')p='/preview/index.html';
 const f=path.resolve(root,'.'+p);if(!f.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.stat(f,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);res.end('Not found');return;}
  const ct=mimes[path.extname(f)]||'application/octet-stream';
  const headers={'content-type':ct,'accept-ranges':'bytes','cache-control':'no-cache'};
  const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(match && path.extname(f)==='.mp4'){
   const start=Number(match[1]);const end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;
   if(start>=stat.size || end<start){res.writeHead(416,{'content-range':`bytes */${stat.size}`});res.end();return;}
   res.writeHead(206,{...headers,'content-length':end-start+1,'content-range':`bytes ${start}-${end}/${stat.size}`});
   fs.createReadStream(f,{start,end}).pipe(res);return;
  }
  res.writeHead(200,{...headers,'content-length':stat.size});fs.createReadStream(f).pipe(res);
 });
}).listen(Number(process.env.PORT||5173),()=>console.log('Q Arepota video preview listening'));
