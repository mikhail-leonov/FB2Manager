@echo off
setlocal enabledelayedexpansion

set OUTPUT=1
if exist %OUTPUT% del %OUTPUT%

call :processDir app
call :processDir core
call :processDir views
call :processDir sql
REM call :processDir js

echo Done
exit /b

:processDir
set DIR=%1

for /r "%DIR%" %%F in (*) do (
    echo Next file is: %%F >> %OUTPUT%
    type "%%F" >> %OUTPUT%
    echo. >> %OUTPUT%
    echo -------------------------------------------------------- >> %OUTPUT%
    echo. >> %OUTPUT%
)

exit /b