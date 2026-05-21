@echo off
setlocal

set "PROJECT_DIR=%~dp0venerable-sprite-294b65-local"
set "PORT=4173"

where python >nul 2>nul
if errorlevel 1 (
  echo Python is not installed or not available in PATH.
  echo Install Python, then run this file again.
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"
echo Starting VirtuLab at http://127.0.0.1:%PORT%
start "" "http://127.0.0.1:%PORT%/admin-login.html"
python ".\serve-local.py" --port %PORT% --root "%PROJECT_DIR%"

pause
