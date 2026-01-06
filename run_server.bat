@echo off
echo Starting server... > startup.log
node server.js >> startup.log 2>&1
echo Server finished. >> startup.log
