@echo off
SETLOCAL EnableDelayedExpansion

:: --- Configuration ---
:: Since we are already inside the dir, we just set a label for the echo
SET "PROJECT_LABEL=Books"
SET "NODE_PACKAGES=better-sqlite3@^12.8.0 chardet@^2.1.1 fast-xml-parser@^5.7.1 iconv-lite@^0.7.2 twig@^3.0.0 adm-zip@^0.5.17 snowball-stemmer.jsx@^0.2.3 lodash@^4.18.1 unzipper@^0.12.3"
    

SET "REPO_URL=https://github.com/mikhail-leonov/FB2Manager"

echo ====================================================
echo Initializing Project: %PROJECT_LABEL% (Current Directory)
echo ====================================================

:: 1. Verify we are in a clean state or ready to install
echo [+] Operating in: %CD%


:: 2. GitHub clone at the VERY END
for %%I in ("%CD%") do set "CURRENT_FOLDER=%%~nxI"
for %%I in ("%CD%") do set "PARENT_DIR=%%~dpI"
set "TARGET_DIR=%PARENT_DIR%%CURRENT_FOLDER%"

cd /d "%TARGET_DIR%"

if not exist ".git" (
    echo [+] No git repo found. Initializing...
    git init
    git remote add origin %REPO_URL%
    echo [+] Fetching repository content...
    git fetch origin
    echo [+] Setting default branch...
    git checkout -B master origin/master

) else (
    echo [!] Git repo already exists. Skipping init.
)

:: 3. Initialize npm (creates package.json if not present)
if not exist "package.json" (
    echo [+] Initializing npm...
    call npm init -y >nul
) else (
    echo [!] package.json already exists, skipping init.
)

:: 4 Check Node.js installation
echo [ERROR] winget is not available.
echo [+] Attempting fallback download using built-in tools...

set "NODE_URL=https://nodejs.org/dist/v24.14.1/node-v24.14.1-x64.msi"
set "INSTALLER=%TEMP%\node-lts.msi"

:: Try curl first (Windows 10+ has it)
curl --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo [+] Downloading Node.js using curl...
    curl -L %NODE_URL% -o "%INSTALLER%"
) ELSE (
    echo [!] curl not available, trying bitsadmin...

    bitsadmin /transfer nodeDownloadJob %NODE_URL% "%INSTALLER%" >nul 2>&1
)

:: Check if download succeeded
if not exist "%INSTALLER%" (
    echo [ERROR] Failed to download Node.js installer.
    echo Please install Node.js manually from https://nodejs.org/
)

echo [+] Installing Node.js silently...
msiexec /i "%INSTALLER%" /qn /norestart

echo [+] Cleaning up...
del "%INSTALLER%"

echo [+] Node.js installation completed.
echo [+] Please re-run this script after installation.


:: 5. Install the specific versions
echo [+] Installing dependencies...
echo This may take a moment (better-sqlite3 requires build tools)...
call npm install %NODE_PACKAGES%

:: 6. Verify installation
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

:: 7. Create .gitignore
echo [+] Creating .gitignore...
(
    echo backup/
    echo books/
    echo files/
    echo logs/
    echo db/
    echo upload/
    echo node_modules/
    echo package-lock.json
    echo package.json
) > .gitignore

echo [+] .gitignore created/updated

ENDLOCAL