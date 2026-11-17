Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\santh\.gemini\antigravity\brain\a9767d0b-63a2-4506-a916-c8227a79b398\.user_uploaded\media_1792383006993_bfad874a.jpg"

if (!(Test-Path $srcPath)) {
    Write-Error "Source image not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source image loaded: $($srcImg.Width) x $($srcImg.Height)"

# Copy high-res mascot to public/ and src/assets/ for in-app UI usage
if (!(Test-Path "src\assets")) {
    New-Item -ItemType Directory -Force -Path "src\assets" | Out-Null
}
$srcImg.Save("public\logo-mascot.png", [System.Drawing.Imaging.ImageFormat]::Png)
$srcImg.Save("src\assets\logo-mascot.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved public\logo-mascot.png and src\assets\logo-mascot.png"

# Helper function to resize with high quality
function Resize-Image($img, $w, $h) {
    $dest = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()
    return $dest
}

# 1. Generate 512x512 PNGs
$bmp512 = Resize-Image $srcImg 512 512
$bmp512.Save("public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Save("electron\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()

# 2. Generate multi-resolution Windows ICO
# Create 256x256 for icon handle
$bmp256 = Resize-Image $srcImg 256 256
$hIcon = $bmp256.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$icoStream1 = New-Object System.IO.FileStream "electron\icon.ico", "Create"
$icon.Save($icoStream1)
$icoStream1.Close()

$icoStream2 = New-Object System.IO.FileStream "public\favicon.ico", "Create"
$icon.Save($icoStream2)
$icoStream2.Close()

$icon.Dispose()
$bmp256.Dispose()
$srcImg.Dispose()

Write-Host "Generated electron\icon.png, electron\icon.ico, public\icon-512.png, public\favicon.ico"
