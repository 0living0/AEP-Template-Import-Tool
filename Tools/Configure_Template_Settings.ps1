# Copyright (C) 2026 yuzhou-2023@foxmail.com
# SPDX-License-Identifier: GPL-3.0-only
# Licensed under the GNU General Public License, version 3 only.
# Distributed WITHOUT ANY WARRANTY. See the accompanying LICENSE file.

param(
    [ValidateSet('zh','en','ja')][string]$Language='zh',
    [string]$PreferencesFile,
    [switch]$DryRun
)
$ErrorActionPreference='Stop'

function Read-PrefsDocument([string]$Path) {
    [byte[]]$bytes=[IO.File]::ReadAllBytes($Path)
    $offset=0
    [byte[]]$bom=@()
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 255 -and $bytes[1] -eq 254) {
        $encoding=New-Object Text.UnicodeEncoding($false,$false,$true);$offset=2
    } elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 254 -and $bytes[1] -eq 255) {
        $encoding=New-Object Text.UnicodeEncoding($true,$false,$true);$offset=2
    } else {
        $encoding=New-Object Text.UTF8Encoding($false,$true)
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 239 -and $bytes[1] -eq 187 -and $bytes[2] -eq 191) {$offset=3}
    }
    if ($offset) {$bom=$bytes[0..($offset-1)]}
    $text=$encoding.GetString($bytes,$offset,$bytes.Length-$offset)
    if ($text -notmatch '^# Text File Version 1\.1') {throw "Unrecognized AE preferences format: $Path"}
    $newline="`r`n";if ($text.Contains("`n") -and -not $text.Contains("`r`n")) {$newline="`n"}
    return @{Bytes=$bytes;Text=$text;Encoding=$encoding;Bom=$bom;Newline=$newline}
}

function Format-PrefsEntry([string]$Key,[string]$Value,[string]$Newline) {
    # Adobe's preference format uses UTF-8 hex for non-ASCII bytes, not JSON escapes.
    $chunks=New-Object 'Collections.Generic.List[string]'
    if ($Value -match '[^\x20-\x7e]|"') {
        $encoded=([BitConverter]::ToString([Text.Encoding]::UTF8.GetBytes($Value))).Replace('-','')
        for ($i=0;$i -lt $encoded.Length;$i+=70) {$chunks.Add($encoded.Substring($i,[Math]::Min(70,$encoded.Length-$i)))}
    } else {
        if ($Value.Length -eq 0) {$chunks.Add('""')}
        for ($i=0;$i -lt $Value.Length;$i+=70) {$chunks.Add('"'+$Value.Substring($i,[Math]::Min(70,$Value.Length-$i))+'"')}
    }
    return "`t"+'"'+$Key+'" = '+($chunks -join ('\'+$Newline+"`t`t"))+$Newline
}

function Update-PrefsText([string]$Text,$Values,[string]$Newline) {
    $section='["Settings_AEPTemplateImportToolSettingsV4"]'
    $headers=[regex]::Matches($Text,'(?m)^\["Settings_AEPTemplateImportToolSettingsV4"\][ \t]*(?:\r?\n|$)')
    if ($headers.Count -gt 1) {throw 'Duplicate script settings sections; nothing was changed.'}
    if ($headers.Count -eq 0) {
        $tail=$Newline+$section+$Newline
        foreach ($key in $Values.Keys) {$tail+=Format-PrefsEntry $key $Values[$key] $Newline}
        return $Text+$tail
    }
    $header=$headers[0];$start=$header.Index+$header.Length
    $next=[regex]::Match($Text.Substring($start),'(?m)^\["')
    $end=$Text.Length;if ($next.Success) {$end=$start+$next.Index}
    $body=$Text.Substring($start,$end-$start)
    $lines=[regex]::Matches($body,'[^\r\n]*(?:\r\n|\n|$)')
    $seen=@{};$builder=New-Object Text.StringBuilder
    for ($i=0;$i -lt $lines.Count;$i++) {
        $line=$lines[$i].Value
        $keyMatch=[regex]::Match($line,'^[ \t]*"([^"]+)"[ \t]*=')
        if ($keyMatch.Success -and $Values.Contains($keyMatch.Groups[1].Value)) {
            $key=$keyMatch.Groups[1].Value
            if ($seen.ContainsKey($key)) {throw "Duplicate setting key: $key. Nothing was changed."}
            $seen[$key]=$true
            while ($line.TrimEnd("`r","`n"," ","`t").EndsWith('\')) {
                $i++;if ($i -ge $lines.Count) {throw "Incomplete continued preference value: $key"}
                $line=$lines[$i].Value
                if ($line -match '^[ \t]*"[^"]+"[ \t]*=') {throw "Malformed continued preference value: $key"}
            }
            [void]$builder.Append((Format-PrefsEntry $key $Values[$key] $Newline))
        } else {[void]$builder.Append($line)}
    }
    foreach ($key in $Values.Keys) {
        if (-not $seen.ContainsKey($key)) {[void]$builder.Append((Format-PrefsEntry $key $Values[$key] $Newline))}
    }
    return $Text.Substring(0,$start)+$builder.ToString()+$Text.Substring($end)
}

$modified=New-Object 'Collections.Generic.List[object]'
try {
    $packageRoot=Split-Path -Parent $PSScriptRoot
    $assetRoot=Join-Path $packageRoot '02_Template_Assets'
    $preset=Join-Path $assetRoot 'Preset'
    $template=Join-Path $assetRoot 'Template\AEP_Template.aep'
    foreach ($required in @($preset,$template,(Join-Path $preset 'Sample\01\1_TP\001\001_LO.jpg'),(Join-Path $preset 'Sample\01\2_BG\001_BG.psd'))) {
        if (-not (Test-Path -LiteralPath $required)) {throw "Missing asset: $required. Extract the complete package first."}
    }
    $config=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'template-settings.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $values=[ordered]@{}
    foreach ($property in $config.PSObject.Properties) {$values[$property.Name]=[string]$property.Value}
    $values.presetRootPath=$preset.Replace('\','/')
    $values.templateAepPath=$template.Replace('\','/')
    $values.language=$Language
    if ($PreferencesFile) {
        $targets=@((Get-Item -LiteralPath $PreferencesFile -ErrorAction Stop))
    } else {
        $prefsRoot=Join-Path $env:APPDATA 'Adobe\After Effects'
        $targets=@(Get-ChildItem -LiteralPath $prefsRoot -Directory -ErrorAction SilentlyContinue |
            Where-Object {$_.Name -match '^\d+\.\d+$'} | ForEach-Object {
                $path=Join-Path $_.FullName ('Adobe After Effects '+$_.Name+' Prefs.txt')
                if (Test-Path -LiteralPath $path -PathType Leaf) {Get-Item -LiteralPath $path}
            })
    }
    if ($targets.Count -eq 0) {throw 'No initialized AE preferences found under APPDATA. Start and close AE once, then run this BAT again.'}
    if (-not $DryRun -and @(Get-Process -Name AfterFX,AfterFXCom -ErrorAction SilentlyContinue).Count -gt 0) {
        throw 'Close all After Effects instances before applying settings. This tool never starts or closes AE.'
    }
    $plans=@()
    foreach ($target in $targets) {
        $document=Read-PrefsDocument $target.FullName
        $updated=Update-PrefsText $document.Text $values $document.Newline
        # A second pass must be byte-stable: also checks all keys and continuations.
        if ((Update-PrefsText $updated $values $document.Newline) -cne $updated) {throw 'Preference verification failed before writing.'}
        [byte[]]$newBytes=$document.Bom+$document.Encoding.GetBytes($updated)
        $plans+=@{Path=$target.FullName;Original=$document.Bytes;Updated=$newBytes}
    }
    if ($DryRun) {
        Write-Host ('Validated {0} settings for {1} preferences file(s). No files changed.' -f $values.Count,$plans.Count)
        foreach ($plan in $plans) {Write-Host $plan.Path}
        $values | ConvertTo-Json -Depth 4
        exit 0
    }
    $backupRoot=Join-Path $packageRoot 'Settings_Backups'
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    $runId=(Get-Date -Format 'yyyyMMdd_HHmmss_fff')+'_'+[Guid]::NewGuid().ToString('N').Substring(0,8)
    $results=@()
    for ($i=0;$i -lt $plans.Count;$i++) {
        $plan=$plans[$i]
        $backup=Join-Path $backupRoot ($runId+'_'+$i+'_'+[IO.Path]::GetFileName($plan.Path)+'.bak')
        [IO.File]::WriteAllBytes($backup,$plan.Original)
        $plan.Backup=$backup
        # Refuse to overwrite edits made since the original file was read.
        if ([Convert]::ToBase64String([IO.File]::ReadAllBytes($plan.Path)) -cne [Convert]::ToBase64String($plan.Original)) {throw 'Preferences changed during configuration. Close AE and retry.'}
        $temp=$plan.Path+'.'+$runId+'.tmp'
        try {
            [IO.File]::WriteAllBytes($temp,$plan.Updated)
            if (@(Get-Process -Name AfterFX,AfterFXCom -ErrorAction SilentlyContinue).Count -gt 0) {throw 'AE started during configuration. Close it and retry.'}
            [IO.File]::Replace($temp,$plan.Path,[NullString]::Value)
            $modified.Add($plan)
        } finally {if (Test-Path -LiteralPath $temp) {Remove-Item -LiteralPath $temp}}
        if ([Convert]::ToBase64String([IO.File]::ReadAllBytes($plan.Path)) -cne [Convert]::ToBase64String($plan.Updated)) {throw 'Written preferences failed verification.'}
        $results+=@{preferencesFile=$plan.Path;backup=$backup;verifiedKeys=$values.Count}
        Write-Host ('Configured and verified: '+$plan.Path) -ForegroundColor Green
        Write-Host ('Backup: '+$backup)
    }
    @{ok=$true;mode='offline_preference_file_edit';language=$Language;settings=$values;results=$results} |
        ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $backupRoot ($runId+'_result.json')) -Encoding UTF8
    Write-Host 'Done. Start AE and open the script panel. No AE process was launched.'
    exit 0
} catch {
    foreach ($plan in $modified) {[IO.File]::WriteAllBytes($plan.Path,$plan.Original)}
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($modified.Count) {Write-Host 'Original preferences were restored.'}
    exit 1
}
