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
tar -a -c -f "%ZIPNAME%" *.md *.cmd *.json server.js js\* sql\* app\* views\* core\* 


:: ---- Git backup section ----
cd /d "%~dp0"

git config --global user.email "mikecommon@gmail.com"
git config --global user.name "Mihail Leonov"

git add *.md *.cmd *.json server.js js\* sql\* app\* views\* core\*



git diff --cached --quiet
if errorlevel 1 (
    echo Changes detected. Committing...

    git commit -m "Auto backup %TS%"
    git push origin master

    echo Git push completed.
) else (
    echo No changes to commit.
)