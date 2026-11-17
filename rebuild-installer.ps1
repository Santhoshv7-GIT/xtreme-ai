$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'

Write-Host '1. Compiling XTREME-AI.exe with mascot icon...'
& $csc /target:winexe /win32icon:electron\icon.ico /out:installer\XTREME-AI.exe installer\AppLauncher.cs

Write-Host '2. Compiling uninstall.exe with mascot icon...'
& $csc /target:winexe /win32icon:electron\icon.ico /out:installer\uninstall.exe installer\Uninstaller.cs

Write-Host '3. Compiling XTREME-AI-Setup.exe...'
& $csc /target:winexe /win32icon:electron\icon.ico /resource:installer\XTREME-AI.exe,AppLauncher /resource:electron\icon.ico,AppIcon /resource:installer\uninstall.exe,AppUninstaller /out:installer\XTREME-AI-Setup.exe installer\Setup.cs

Write-Host '4. Updating public\downloads\XTREME-AI-Setup.exe...'
Copy-Item -Force installer\XTREME-AI-Setup.exe public\downloads\XTREME-AI-Setup.exe

# 5. Update installed desktop files
$appDir = Join-Path $env:LOCALAPPDATA 'Programs\XTREME AI'
if (!(Test-Path $appDir)) {
    New-Item -ItemType Directory -Force -Path $appDir | Out-Null
}

$newIcoPath = Join-Path $appDir 'xtreme-mascot-v1.ico'
Copy-Item -Force electron\icon.ico $newIcoPath
Copy-Item -Force electron\icon.ico (Join-Path $appDir 'icon.ico')
Copy-Item -Force installer\XTREME-AI.exe (Join-Path $appDir 'XTREME-AI.exe')
Copy-Item -Force installer\XTREME-AI.exe (Join-Path $appDir 'XTREME AI.exe')

# 6. Update shortcuts on OneDrive Desktop & Standard Desktop
$sh = New-Object -ComObject WScript.Shell

$desktops = @(
    [System.IO.Path]::Combine([Environment]::GetFolderPath('UserProfile'), 'OneDrive\Desktop'),
    [Environment]::GetFolderPath('Desktop')
)

foreach ($d in $desktops) {
    if (Test-Path $d) {
        $lnk = Join-Path $d 'XTREME AI.lnk'
        if (Test-Path $lnk) { Remove-Item -Force $lnk }
        $sc = $sh.CreateShortcut($lnk)
        $sc.TargetPath = Join-Path $appDir 'XTREME AI.exe'
        $sc.WorkingDirectory = $appDir
        $sc.IconLocation = "$newIcoPath,0"
        $sc.Description = 'XTREME AI — Chat • Learn • Create'
        $sc.Save()
        Write-Host "Updated desktop shortcut at: $lnk with icon $newIcoPath"
    }
}

# 7. Update Start Menu shortcut
$startMenuDir = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs')
$startLnk = Join-Path $startMenuDir 'XTREME AI.lnk'
if (Test-Path $startLnk) { Remove-Item -Force $startLnk }
$sc2 = $sh.CreateShortcut($startLnk)
$sc2.TargetPath = Join-Path $appDir 'XTREME AI.exe'
$sc2.WorkingDirectory = $appDir
$sc2.IconLocation = "$newIcoPath,0"
$sc2.Description = 'XTREME AI — Chat • Learn • Create'
$sc2.Save()

# 8. Notify Windows Shell & Restart Explorer
try {
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellHelper2 {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
    [ShellHelper2]::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero)
    Write-Host 'Notified Windows Shell of icon change'
} catch {}

Stop-Process -Name explorer -Force
Start-Sleep -Milliseconds 600
Start-Process explorer.exe

Write-Host 'Rebuild and desktop icon refresh completed successfully!'
