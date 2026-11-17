Add-Type -AssemblyName System.Drawing

$sourceIco = "electron\icon.ico"
$appDir = Join-Path $env:LOCALAPPDATA 'Programs\XTREME AI'

if (!(Test-Path $appDir)) {
    New-Item -ItemType Directory -Force -Path $appDir | Out-Null
}

# 1. Use a fresh unique icon filename so Windows bypasses any cached icon database
$newIconName = "xtreme-v" + (Get-Date -Format "yyyyMMddHHmmss") + ".ico"
$destIconPath = Join-Path $appDir $newIconName

Copy-Item -Force $sourceIco $destIconPath
Copy-Item -Force $sourceIco (Join-Path $appDir "icon.ico")
Copy-Item -Force "installer\XTREME-AI.exe" (Join-Path $appDir "XTREME-AI.exe")
Copy-Item -Force "installer\XTREME-AI.exe" (Join-Path $appDir "XTREME AI.exe")

Write-Host "Copied new icon to: $destIconPath"

$sh = New-Object -ComObject WScript.Shell

# 2. Update OneDrive Desktop Shortcut
$oneDriveDesktop = [System.IO.Path]::Combine([Environment]::GetFolderPath('UserProfile'), 'OneDrive\Desktop')
$oneDriveLnk = Join-Path $oneDriveDesktop "XTREME AI.lnk"
if (Test-Path $oneDriveLnk) {
    Remove-Item -Force $oneDriveLnk
}
$sc1 = $sh.CreateShortcut($oneDriveLnk)
$sc1.TargetPath = Join-Path $appDir "XTREME AI.exe"
$sc1.WorkingDirectory = $appDir
$sc1.IconLocation = "$destIconPath,0"
$sc1.Description = "XTREME AI - Advanced Intelligence"
$sc1.Save()
Write-Host "Re-created shortcut at: $oneDriveLnk with icon $destIconPath"

# 3. Update Standard Desktop Shortcut (if applicable)
$stdDesktop = [Environment]::GetFolderPath('Desktop')
if ($stdDesktop -ne $oneDriveDesktop) {
    $stdLnk = Join-Path $stdDesktop "XTREME AI.lnk"
    if (Test-Path $stdLnk) {
        Remove-Item -Force $stdLnk
    }
    $sc2 = $sh.CreateShortcut($stdLnk)
    $sc2.TargetPath = Join-Path $appDir "XTREME AI.exe"
    $sc2.WorkingDirectory = $appDir
    $sc2.IconLocation = "$destIconPath,0"
    $sc2.Description = "XTREME AI - Advanced Intelligence"
    $sc2.Save()
    Write-Host "Re-created shortcut at: $stdLnk with icon $destIconPath"
}

# 4. Update Start Menu Shortcut
$startMenuDir = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs')
$startLnk = Join-Path $startMenuDir "XTREME AI.lnk"
if (Test-Path $startLnk) {
    Remove-Item -Force $startLnk
}
$sc3 = $sh.CreateShortcut($startLnk)
$sc3.TargetPath = Join-Path $appDir "XTREME AI.exe"
$sc3.WorkingDirectory = $appDir
$sc3.IconLocation = "$destIconPath,0"
$sc3.Description = "XTREME AI - Advanced Intelligence"
$sc3.Save()
Write-Host "Re-created shortcut at: $startLnk with icon $destIconPath"

# 5. Flush Shell Change Notification
try {
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellHelper {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
    # SHCNE_ASSOCCHANGED = 0x08000000, SHCNF_FLUSH = 0x1000
    [ShellHelper]::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)
    Write-Host "Notified Windows Shell with SHCNF_FLUSH"
} catch {
    Write-Host "Shell notify: $($_.Exception.Message)"
}

Write-Host "Completed successfully!"
