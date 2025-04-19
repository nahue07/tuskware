@echo off
echo Instalando dependencias...
call npm install

echo.
echo Iniciando servidor Vite...
call npm run dev

pause