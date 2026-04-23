@echo off
setlocal enabledelayedexpansion

:: ---- Create backup folder ----
if not exist "backup" mkdir backup

:: ---- Create a file name as a TimeStamp YYYY-mm-dd-HH-ss-ii ----
for /f %%i in ('wmic os get LocalDateTime ^| find "."') do set dt=%%i
set TS=!dt:~0,4!-!dt:~4,2!-!dt:~6,2!-!dt:~8,2!-!dt:~10,2!-!dt:~12,2!

:: ---- Create a backup file  ----
set ZIPNAME=backup\%TS%.zip

echo Creating backup: %ZIPNAME%
echo.

:: ---- Backup  ----
tar -a -c -f "%ZIPNAME%" *.md *.cmd *.json server.js js\* css\* sql\* app\* views\* core\* 

