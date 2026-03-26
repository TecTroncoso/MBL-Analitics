@echo off
title BuildMBL - Entorno Activado
echo Activando entorno virtual...
call venv\Scripts\activate.bat
echo Abriendo Antigravity...
start "" antigravity .
echo.
echo Entorno listo. No cierres esta ventana si quieres usar pip.
cmd /k
