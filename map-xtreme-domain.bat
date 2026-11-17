@echo off
echo ========================================================
echo   XTREME AI - Local Domain Mapper (www.xtremeai.com)
echo ========================================================
echo.

:: Check for administrative permissions
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrator privileges.
) else (
    echo [ERROR] This script requires Administrator privileges.
    echo Please right-click this file and select "Run as Administrator".
    pause
    exit /b 1
)

set HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts

:: Check if already mapped
findstr /i "www.xtremeai.com" "%HOSTS_FILE%" >nul
if %errorLevel% == 0 (
    echo [INFO] www.xtremeai.com is already mapped in your hosts file.
) else (
    echo 127.0.0.1 www.xtremeai.com www.xtreme-ai.com xtremeai.com >> "%HOSTS_FILE%"
    echo [SUCCESS] Successfully mapped www.xtremeai.com and www.xtreme-ai.com to 127.0.0.1!
)

echo.
echo You can now open your browser and navigate to:
echo   http://www.xtremeai.com
echo   http://www.xtreme-ai.com
echo.
pause
