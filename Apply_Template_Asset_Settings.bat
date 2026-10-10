@echo off
rem Copyright (C) 2026 yuzhou-2023@foxmail.com
rem SPDX-License-Identifier: GPL-3.0-only
rem Licensed under the GNU General Public License, version 3 only.
rem Distributed WITHOUT ANY WARRANTY. See the accompanying LICENSE file.
setlocal
set "TOOL_LANGUAGE=zh"
if not "%~1"=="" set "TOOL_LANGUAGE=%~1"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tools\Configure_Template_Settings.ps1" -Language "%TOOL_LANGUAGE%"
set "RESULT=%ERRORLEVEL%"
echo.
if not "%RESULT%"=="0" echo Configuration failed. See the message above.
if not defined AEP_GUIDE_NO_PAUSE pause
exit /b %RESULT%
