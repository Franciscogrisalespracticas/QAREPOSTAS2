# Requiere Windows PowerShell 5.1+ y conexion a internet.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcFolder = Join-Path $root 'public\assets\video'
$mirrorFolder = Join-Path $root 'assets\video'
New-Item -Type Directory -Force -Path $srcFolder, $mirrorFolder | Out-Null
$items = Get-Content -LiteralPath (Join-Path $root 'VIDEO_SOURCES.json') -Raw | ConvertFrom-Json
function Is-Mp4($file) {
    if (!(Test-Path -LiteralPath $file)) {return $false}
    if ((Get-Item $file).Length -lt 30000) {return $false}
    $fs = [IO.File]::OpenRead($file)
    try {
        $header = New-Object byte[] 24
        $null = $fs.Read($header, 0, 24)
        return ([Text.Encoding]::ASCII.GetString($header)).Contains('ftyp')
    } finally {$fs.Dispose()}
}
$installed = @()
foreach ($item in $items) {
    $out = Join-Path $srcFolder ($item.id + '.mp4')
    if (!(Is-Mp4 $out)) {
        Write-Host ('Descargando ' + $item.id + '...') -ForegroundColor Cyan
        $temp = $out + '.partial'
        $urlList = @($item.directUrl, ('https://www.pexels.com/download/video/' + $item.videoId + '/'))
        foreach ($url in $urlList) {
            try {
                Invoke-WebRequest -Uri $url -OutFile $temp -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36' -TimeoutSec 120 -MaximumRedirection 8
                if (Is-Mp4 $temp) {Move-Item -LiteralPath $temp -Destination $out -Force;break}
                throw 'La URL no entrego un MP4 valido.'
            } catch {Write-Warning ($item.id + ': ' + $_.Exception.Message)}
            finally {Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue}
        }
    }
    if (Is-Mp4 $out) {
        Copy-Item -LiteralPath $out -Destination (Join-Path $mirrorFolder ($item.id + '.mp4')) -Force
        $installed += $item.id
        Write-Host ('OK: ' + $item.id) -ForegroundColor Green
    } else {Write-Warning ('PENDIENTE: ' + $item.id + ', vea VIDEOS_PENDIENTES.html')}
}
$jsonManifest = ConvertTo-Json -InputObject @($installed) -Compress
[IO.File]::WriteAllText((Join-Path $srcFolder 'manifest.json'), $jsonManifest, (New-Object System.Text.UTF8Encoding $false))
[IO.File]::WriteAllText((Join-Path $mirrorFolder 'manifest.json'), $jsonManifest, (New-Object System.Text.UTF8Encoding $false))
Write-Host ('VIDEOS REALES INSTALADOS: ' + $installed.Count + ' / ' + $items.Count) -ForegroundColor Yellow
Write-Host 'Si falta alguno, descarguelo desde su pagina Pexels y guardelo como public/assets/video/ID.mp4'
