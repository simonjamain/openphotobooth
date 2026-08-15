@echo off

set "PHOTOBOOTH_DIR=%LOCALAPPDATA%\openphotobooth"
set "CHROME_PROFILE=%PHOTOBOOTH_DIR%\ChromeProfile"

start "" chrome.exe ^
  --user-data-dir="%CHROME_PROFILE%" ^
  --kiosk ^
  --no-first-run ^
  --no-default-browser-check ^
  --disable-web-security ^
  --allow-running-insecure-content ^
  "https://simonjamain.github.io/openphotobooth/"