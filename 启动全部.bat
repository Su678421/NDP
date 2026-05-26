@echo off
echo 正在启动 MongoDB...
start "MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "E:\ndp-backend\data\db"

timeout /t 3 /nobreak >nul

echo 正在启动应用服务器...
cd E:\ndp-backend
node server.js