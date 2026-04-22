@echo off
setlocal

echo Stopping server.cmd...

REM Kill all cmd processes running server.cmd
taskkill /IM node.exe /F

REM Small delay to ensure process is fully stopped
timeout /t 2 /nobreak >nul

echo Deleting...

echo Removing db directory...
if exist db (
    rmdir /S /Q db
)

echo Removing files directory...
if exist files (
    rmdir /S /Q files
)
