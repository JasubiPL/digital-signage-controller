@echo off

cd C:/dev/digital-signage/Interface
start cmd /k "yarn dev --host"


cd C:/dev/digital-signage/Server
start cmd /k "npm run dev"