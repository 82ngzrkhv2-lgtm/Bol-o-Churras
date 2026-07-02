# scripts/generate-icons.ps1
# Script to generate PWA icons relative to script root

Add-Type -AssemblyName System.Drawing

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$logoPath = Join-Path $projectDir "public\logo.png"
$icon192Path = Join-Path $projectDir "public\icon-192.png"
$icon512Path = Join-Path $projectDir "public\icon-512.png"

if (-not (Test-Path $logoPath)) {
    Write-Error "logo.png not found at path: $logoPath"
    exit 1
}

Write-Host "Loading logo.png..."
$src = [System.Drawing.Image]::FromFile($logoPath)

function Resize-Image($newWidth, $newHeight, $outputPath) {
    Write-Host "Generating $newWidth x $newHeight icon..."
    $bmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g.DrawImage($src, 0, 0, $newWidth, $newHeight)
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $bmp.Dispose()
    $g.Dispose()
    Write-Host "Saved to $outputPath"
}

Resize-Image 192 192 $icon192Path
Resize-Image 512 512 $icon512Path

$src.Dispose()
Write-Host "Icons generation completed successfully!"
