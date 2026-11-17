$desktopPath = [Environment]::GetFolderPath('Desktop')
Write-Host "Desktop folder: $desktopPath"

$sh = New-Object -ComObject WScript.Shell
$found = 0

Get-ChildItem -Path $desktopPath -Filter "*XTREME*" | ForEach-Object {
    $found++
    $sc = $sh.CreateShortcut($_.FullName)
    Write-Host "Found Shortcut: $($_.FullName)"
    Write-Host "Target: $($sc.TargetPath)"
    Write-Host "IconLocation: $($sc.IconLocation)"
}

# Also check CommonDesktop (All Users)
$commonDesktop = [Environment]::GetFolderPath('CommonDesktopDirectory')
Write-Host "Common Desktop folder: $commonDesktop"
Get-ChildItem -Path $commonDesktop -Filter "*XTREME*" -ErrorAction SilentlyContinue | ForEach-Object {
    $found++
    $sc = $sh.CreateShortcut($_.FullName)
    Write-Host "Found Common Shortcut: $($_.FullName)"
    Write-Host "Target: $($sc.TargetPath)"
    Write-Host "IconLocation: $($sc.IconLocation)"
}

# Also check Start Menu shortcuts
$startMenu = [System.IO.Path]::Combine($env:APPDATA, 'Microsoft\Windows\Start Menu\Programs')
Get-ChildItem -Path $startMenu -Filter "*XTREME*" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $sc = $sh.CreateShortcut($_.FullName)
    Write-Host "Found StartMenu Shortcut: $($_.FullName)"
    Write-Host "IconLocation: $($sc.IconLocation)"
}
