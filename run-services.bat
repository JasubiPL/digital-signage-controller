@echo off

cd C:/dev/digital-signage/Interface
start cmd /k "yarn start --host"


cd C:/dev/digital-signage/Server
start cmd /k "npm run dev"
