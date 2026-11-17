@echo off
cls
echo ========================================================
echo        XTREME AI - Netlify Cloud Production Deployer
echo ========================================================
echo.
echo 1. Building latest production bundle...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed! Please inspect errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Preparing Netlify SPA routing...
copy /Y dist\index.html dist\200.html >nul

echo.
echo 3. Deploying to Netlify...
call npx --yes netlify deploy --dir=dist

echo.
echo 4. Publishing latest release to production live URL...
node -e "const fs = require('fs'); const cfg = JSON.parse(fs.readFileSync(process.env.APPDATA + '/netlify/Config/config.json', 'utf8')); const token = cfg.users[cfg.userId]?.auth?.token; fetch('https://api.netlify.com/api/v1/sites/b7cc52f5-90ad-4c59-aefa-a8deb980253f/deploys?per_page=1', { headers: { 'Authorization': 'Bearer ' + token } }).then(r => r.json()).then(deploys => { const id = deploys[0]?.id; if (!id) return; fetch('https://api.netlify.com/api/v1/sites/b7cc52f5-90ad-4c59-aefa-a8deb980253f/deploys/' + id + '/restore', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token } }).then(r => console.log('Successfully published live: https://xtreme-ai-model.netlify.app')); });"

echo.
echo ========================================================
echo   Live URL: https://xtreme-ai-model.netlify.app
echo ========================================================
echo.
pause
