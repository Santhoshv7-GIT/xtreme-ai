Add-Type -AssemblyName System.Drawing

function Draw-XtremeLogo($size, $outputPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = [float]$size / 100.0

    # 1. Dark Rounded App Tile Background
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $radius = [float]($size * 0.2)
    $dia = $radius * 2.0
    $fSize = [float]$size
    $path.AddArc(0.0, 0.0, $dia, $dia, 180.0, 90.0)
    $path.AddArc($fSize - $dia, 0.0, $dia, $dia, 270.0, 90.0)
    $path.AddArc($fSize - $dia, $fSize - $dia, $dia, $dia, 0.0, 90.0)
    $path.AddArc(0.0, $fSize - $dia, $dia, $dia, 90.0, 90.0)
    $path.CloseFigure()

    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 12, 14, 20))
    $g.FillPath($bgBrush, $path)

    # Subtle cyan border on tile
    $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, 0, 240, 255), [Math]::Max(1.5, [float]$size * 0.015))
    $g.DrawPath($borderPen, $path)

    # 2. Hexagon Outline
    $hexPts = @(
        (New-Object System.Drawing.PointF (50.0 * $scale), (6.0 * $scale)),
        (New-Object System.Drawing.PointF (90.0 * $scale), (27.0 * $scale)),
        (New-Object System.Drawing.PointF (90.0 * $scale), (73.0 * $scale)),
        (New-Object System.Drawing.PointF (50.0 * $scale), (94.0 * $scale)),
        (New-Object System.Drawing.PointF (10.0 * $scale), (73.0 * $scale)),
        (New-Object System.Drawing.PointF (10.0 * $scale), (27.0 * $scale))
    )
    $hexBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(50, 0, 240, 255))
    $hexPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(120, 0, 240, 255), [Math]::Max(1.0, 2.0 * $scale))
    $g.FillPolygon($hexBrush, $hexPts)
    $g.DrawPolygon($hexPen, $hexPts)

    # 3. Wing 1 (Fiery Amber -> Orange -> Crimson Slash) Top-Right to Bottom-Left
    $w1Pts = @(
        (New-Object System.Drawing.PointF (78.0 * $scale), (18.0 * $scale)),
        (New-Object System.Drawing.PointF (88.0 * $scale), (28.0 * $scale)),
        (New-Object System.Drawing.PointF (32.0 * $scale), (84.0 * $scale)),
        (New-Object System.Drawing.PointF (22.0 * $scale), (74.0 * $scale))
    )
    $w1Brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        (New-Object System.Drawing.PointF (88.0 * $scale), (18.0 * $scale)),
        (New-Object System.Drawing.PointF (22.0 * $scale), (84.0 * $scale)),
        [System.Drawing.Color]::FromArgb(255, 255, 184, 0),
        [System.Drawing.Color]::FromArgb(255, 255, 61, 0)
    )
    $g.FillPolygon($w1Brush, $w1Pts)

    # Wing 1 Accent notch
    $w1Acc = @(
        (New-Object System.Drawing.PointF (84.0 * $scale), (24.0 * $scale)),
        (New-Object System.Drawing.PointF (94.0 * $scale), (34.0 * $scale)),
        (New-Object System.Drawing.PointF (78.0 * $scale), (50.0 * $scale)),
        (New-Object System.Drawing.PointF (68.0 * $scale), (40.0 * $scale))
    )
    $acc1Brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 255, 184, 0))
    $g.FillPolygon($acc1Brush, $w1Acc)

    # 4. Wing 2 (Electric Cyan -> Vivid Violet -> Pink Slash) Top-Left to Bottom-Right
    $w2Pts = @(
        (New-Object System.Drawing.PointF (22.0 * $scale), (28.0 * $scale)),
        (New-Object System.Drawing.PointF (32.0 * $scale), (18.0 * $scale)),
        (New-Object System.Drawing.PointF (88.0 * $scale), (74.0 * $scale)),
        (New-Object System.Drawing.PointF (78.0 * $scale), (84.0 * $scale))
    )
    $w2Brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        (New-Object System.Drawing.PointF (22.0 * $scale), (18.0 * $scale)),
        (New-Object System.Drawing.PointF (88.0 * $scale), (84.0 * $scale)),
        [System.Drawing.Color]::FromArgb(255, 0, 240, 255),
        [System.Drawing.Color]::FromArgb(255, 255, 0, 122)
    )
    $cb = New-Object System.Drawing.Drawing2D.ColorBlend 3
    $cb.Colors = @(
        [System.Drawing.Color]::FromArgb(255, 0, 240, 255),
        [System.Drawing.Color]::FromArgb(255, 112, 0, 255),
        [System.Drawing.Color]::FromArgb(255, 255, 0, 122)
    )
    $cb.Positions = @(0.0, 0.5, 1.0)
    $w2Brush.InterpolationColors = $cb
    $g.FillPolygon($w2Brush, $w2Pts)

    # Wing 2 Accent notch
    $w2Acc = @(
        (New-Object System.Drawing.PointF (16.0 * $scale), (34.0 * $scale)),
        (New-Object System.Drawing.PointF (26.0 * $scale), (24.0 * $scale)),
        (New-Object System.Drawing.PointF (42.0 * $scale), (40.0 * $scale)),
        (New-Object System.Drawing.PointF (32.0 * $scale), (50.0 * $scale))
    )
    $acc2Brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(230, 0, 240, 255))
    $g.FillPolygon($acc2Brush, $w2Acc)

    # 5. Center Power Core Diamond
    $corePts = @(
        (New-Object System.Drawing.PointF (50.0 * $scale), (38.0 * $scale)),
        (New-Object System.Drawing.PointF (62.0 * $scale), (50.0 * $scale)),
        (New-Object System.Drawing.PointF (50.0 * $scale), (62.0 * $scale)),
        (New-Object System.Drawing.PointF (38.0 * $scale), (50.0 * $scale))
    )
    $coreBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
    $g.FillPolygon($coreBrush, $corePts)

    # 6. Central Cyan Dot
    $dotR = [float](3.5 * $scale)
    $dotBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 0, 240, 255))
    $g.FillEllipse($dotBrush, [float](50.0 * $scale - $dotR), [float](50.0 * $scale - $dotR), [float]($dotR * 2.0), [float]($dotR * 2.0))

    if ($outputPath) {
        $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }

    $g.Dispose()
    return $bmp
}

# Generate 512, 256, 128, 64, 48, 32, 16
$bmp512 = Draw-XtremeLogo 512 'public/icon-512.png'
$bmp256 = Draw-XtremeLogo 256 'electron/icon.png'

# Create proper Windows .ico file from $bmp256
$hIcon = $bmp256.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$icoStream1 = New-Object System.IO.FileStream 'electron/icon.ico', 'Create'
$icon.Save($icoStream1)
$icoStream1.Close()

$icoStream2 = New-Object System.IO.FileStream 'public/favicon.ico', 'Create'
$icon.Save($icoStream2)
$icoStream2.Close()

$icon.Dispose()
$bmp256.Dispose()
$bmp512.Dispose()

Write-Host "Success: Generated electron/icon.png, electron/icon.ico, public/icon-512.png, public/favicon.ico"
