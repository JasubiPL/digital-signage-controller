@echo off
setlocal

set "ROOT=%~dp0"

cd /d "%ROOT%App"
start "Digital Signage Controller" cmd /k "npm run dev -- --hostname 0.0.0.0"

endlocal
