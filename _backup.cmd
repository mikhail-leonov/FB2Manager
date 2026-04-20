@echo off
setlocal enabledelayedexpansion

:: Create backup folder
if not exist "backup" mkdir backup

for /f %%i in ('wmic os get LocalDateTime ^| find "."') do set dt=%%i
set TS=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!-!dt:~8,2!-!dt:~10,2!-!dt:~12,2!

set ZIPNAME=backup\%TS%.zip

echo Creating backup: %ZIPNAME%
echo.

tar -a -c -f "%ZIPNAME%" *.cmd *.json server.js js\* sql\* app\* views\* core\* 
