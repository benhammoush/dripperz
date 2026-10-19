<#
.SYNOPSIS
Create approved 1000px transparent PNG derivatives from the validated rarity manifest.
.PARAMETER LegacyRoot
Explicit path to the untouched legacy archive. No downloads or generator execution occur.
.PARAMETER ProjectRoot
Destination project containing the prepared data and source manifest.
#>
param(
    [Parameter(Mandatory = $true)][string]$LegacyRoot,
    [string]$ProjectRoot = (Split-Path $PSScriptRoot -Parent)
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$manifestPath = Join-Path $ProjectRoot 'docs/rarity-source-manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.schema -ne 1 -or $manifest.assets.Count -ne 128) { throw 'Invalid approved manifest' }
$outputRoot = Join-Path $ProjectRoot 'public/rarity'
foreach ($asset in $manifest.assets) {
    if ($asset.output -notmatch '^layers/t\d{3}\.png$' -or
        $asset.source -notmatch '^(gen|src)/trait-layers/(BACKGROUND|BACKOBJECT|ROBOT|CHAIN|HEAD|CLOTHES|HEADACC)/[^/\\]+\.png$') {
        throw 'Asset path outside the approved layer directories'
    }
    $sourcePath = Join-Path $LegacyRoot $asset.source
    if ((Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $asset.sourceSha256) {
        throw 'Source image changed since audit'
    }
}
New-Item -ItemType Directory -Path (Join-Path $outputRoot 'layers') -Force | Out-Null
$total = 0
foreach ($asset in $manifest.assets) {
    $source = [System.Drawing.Image]::FromFile((Join-Path $LegacyRoot $asset.source))
    $target = $null
    $graphics = $null
    try {
        if ($source.Width -ne 2000 -or $source.Height -ne 2000) { throw 'Unexpected source dimensions' }
        $target = New-Object System.Drawing.Bitmap 1000,1000
        $graphics = [System.Drawing.Graphics]::FromImage($target)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source,0,0,1000,1000)
        $destination = Join-Path $outputRoot $asset.output
        $target.Save($destination,[System.Drawing.Imaging.ImageFormat]::Png)
        $bytes = (Get-Item -LiteralPath $destination).Length
        $total += $bytes
        $asset | Add-Member -NotePropertyName outputSha256 -NotePropertyValue (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant() -Force
        $asset | Add-Member -NotePropertyName bytes -NotePropertyValue $bytes -Force
    } finally {
        if ($graphics) { $graphics.Dispose() }
        if ($target) { $target.Dispose() }
        $source.Dispose()
    }
}
$manifest | Add-Member -NotePropertyName imageSize -NotePropertyValue 1000 -Force
$manifest | Add-Member -NotePropertyName optimizedImageBytes -NotePropertyValue $total -Force
$json = $manifest | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($manifestPath, $json + "`n", (New-Object System.Text.UTF8Encoding $false))
Write-Output "Prepared 128 transparent 1000px layers: $total bytes"
