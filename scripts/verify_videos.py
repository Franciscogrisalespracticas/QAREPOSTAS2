from pathlib import Path
import json,sys,subprocess
root=Path(__file__).resolve().parents[1]
items=json.loads((root/'VIDEO_SOURCES.json').read_text(encoding='utf-8'))
found=[]
for i in items:
 f=root/'public/assets/video'/(i['id']+'.mp4')
 ok=False
 if f.exists() and f.stat().st_size>30000:
  with f.open('rb') as h:ok=b'ftyp' in h.read(64)
 print(('OK' if ok else 'FALTA'),i['id'],(str(f.stat().st_size//1024)+' KB' if ok else 'SIN MP4'))
 if ok:found.append(i['id'])
print('RESULTADO: '+str(len(found))+'/'+str(len(items))+' VIDEOS REALES INSTALADOS')
sys.exit(0 if len(found)==len(items) else 1)
