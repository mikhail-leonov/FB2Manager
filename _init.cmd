@echo off
SETLOCAL EnableDelayedExpansion

:: --- Configuration ---
:: Since we are already inside the dir, we just set a label for the echo
SET "PROJECT_LABEL=Books"
SET "NODE_PACKAGES=better-sqlite3@^12.8.0 chardet@^2.1.1 fast-xml-parser@^5.7.1 iconv-lite@^0.7.2 twig@^3.0.0"

echo ====================================================
echo Initializing Project: %PROJECT_LABEL% (Current Directory)
echo ====================================================

:: 1. Verify we are in a clean state or ready to install
echo [+] Operating in: %CD%

:: 2. Initialize npm (creates package.json if not present)
if not exist "package.json" (
    echo [+] Initializing npm...
    call npm init -y >nul
) else (
    echo [!] package.json already exists, skipping init.
)

:: 3. Install the specific versions
echo [+] Installing dependencies...
echo This may take a moment (better-sqlite3 requires build tools)...
call npm install %NODE_PACKAGES%

:: 4. Verify installation
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================
    echo SUCCESS: Packages installed in %CD%
    echo ====================================================
    echo [+] Installed Modules:
    dir /B node_modules
) else (
    echo.
    echo [ERROR] Installation failed. 
    echo Check if Node.js is installed and you have an internet connection.
    echo Note: better-sqlite3 may require Visual Studio Build Tools.
    pause
)

ENDLOCAL
