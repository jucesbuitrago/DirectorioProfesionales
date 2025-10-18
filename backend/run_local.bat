@echo off
REM Ejecuta el backend desde la carpeta 'backend' usando el entrypoint local (main:app)
setlocal
cd /d "%~dp0"
py -3.10 -m uvicorn main:app --host 127.0.0.1 --port 8765 --reload
endlocal