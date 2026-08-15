@echo off

set "PHOTOBOOTH_DIR=%LOCALAPPDATA%\openphotobooth-dev"
set "CHROME_PROFILE=%PHOTOBOOTH_DIR%\ChromeProfile"

start "" chrome.exe ^
  --user-data-dir="%CHROME_PROFILE%" ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-web-security ^
  --allow-running-insecure-content ^
  "http://localhost:5173"