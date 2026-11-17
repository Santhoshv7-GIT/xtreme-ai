Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 'electron/icon.png'
Write-Host "Size: $($bmp.Width) x $($bmp.Height)"
Write-Host "Center: $($bmp.GetPixel(128, 128))"
Write-Host "Wing Left: $($bmp.GetPixel(80, 80))"
Write-Host "Wing Right: $($bmp.GetPixel(180, 80))"
Write-Host "Corner: $($bmp.GetPixel(5, 5))"
$bmp.Dispose()
