echo Stopping server.cmd...

REM Kill all cmd processes running server.cmd
tasklist /FI "IMAGENAME eq node.exe" | find /I "node.exe" >nul

IF %ERRORLEVEL%==0 (
    echo Node.js process found. Killing...
    taskkill /IM node.exe /F
)

node server.js
