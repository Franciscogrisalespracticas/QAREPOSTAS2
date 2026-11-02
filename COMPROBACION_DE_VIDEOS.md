# Q AREPOTA - comprobacion de los siete videos

## Estado real del ZIP

- MP4 originales de comida incluidos: **0 de 7**.
- Videos de archivo localizados con su pagina de Pexels: **7 de 7**.
- Enlaces directos de CDN documentados: **7 de 7** (no se pudieron reproducir aqui).
- Mecanismo de instalacion Windows: `INSTALAR_7_VIDEOS.bat` (PowerShell, no necesita Python).
- Descarga manual: `VIDEOS_PENDIENTES.html`.
- La web reproduce MP4 locales antes de consultar fuentes remotas.
- El diagnostico interno evita presentar una foto con zoom como video.

## Como comprobar el resultado en Windows

1. Descomprima todo el ZIP.
2. Ejecute `INSTALAR_7_VIDEOS.bat` con acceso a internet.
3. Si alguna descarga falla, use `VIDEOS_PENDIENTES.html` y guarde el archivo con el nombre indicado en `public/assets/video/`.
4. Ejecute `INSTALAR_7_VIDEOS.bat` otra vez para reconstruir las copias y el manifiesto.
5. Si tiene Python, ejecute `python scripts/verify_videos.py` y compruebe **7/7**.
6. Abra `preview/index.html` con Live Server o ejecute `npm run dev`.
7. En el menu principal, navegue con las flechas por los siete platos y confirme que el distintivo indica `VIDEO REAL REPRODUCIENDOSE` en cada caso. Cuando el video no este disponible, el reproductor lo indicara.

**NOTA:** El videoclip ilustrativo de salchichas NO demuestra que sean butifarras colombianas. Los videos de Pexels son material contextual, no filmaciones de los productos reales del negocio.

## Pruebas realizadas en este entorno

- `node scripts/test-offline.cjs`: PASS (estructura, siete productos, referencias, vista previa).
- `node scripts/build-preview.cjs`: PASS.
- Servidor local: HTTP 200 para HTML, JS e imagenes; HTTP 206 con `Range: bytes=0-127` para un MP4 tecnico temporal; se excluyo el MP4 temporal del ZIP final.
- `python scripts/descargar_videos.py --rebuild-only`: 0 de 7 MP4, confirmado.
- Intentos de descargar Pexels desde este entorno: bloqueados por DNS/red; tampoco fue posible verificar la reproduccion de esos videos externos en navegador.
- Navegacion automatizada con Chromium: bloqueada por la politica de red del entorno. No se declara aprobada.
- Compilacion completa Vite/npm: no verificada por acceso restringido al registro npm.
