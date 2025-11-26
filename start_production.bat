@echo off
echo Starting SoundManager in PRODUCTION mode...
echo.

REM Check if python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python not found! Please install Python.
    pause
    exit /b
)

REM Navigate to backend directory
cd backend

REM Get Local IP Address
for /f "tokens=14" %%a in ('ipconfig ^| findstr IPv4') do set IP=%%a

echo.
echo ========================================================
echo  SERVER RUNNING!
echo.
echo  Access from this PC:     http://localhost:8080
echo  Access from Mobile/LAN:  http://%IP%:8080
echo ========================================================
echo.

REM Start Waitress Server
start "" "http://localhost:8080"
python -m waitress --port=8080 app:app

pause
