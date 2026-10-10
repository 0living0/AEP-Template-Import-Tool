# AEP Template Import Tool

[GitHub project](https://github.com/0living0/AEP-Template-Import-Tool) · [Releases](https://github.com/0living0/AEP-Template-Import-Tool/releases)

源码仓库中的 JSX 位于根目录，配置辅助文件位于 `Tools/`。视频、模板素材和三语 PDF 随完整发布包提供，请从 Releases 下载 ZIP 并完整解压后使用 BAT。下文路径均相对于该发布包。

The repository contains the JSX source and configuration utility. Download the complete ZIP from Releases for videos, template assets and the trilingual PDF. The paths below refer to the extracted release package; run its BAT after extracting the complete ZIP.

リポジトリには JSX ソースと設定ツールを収録しています。動画・テンプレート素材・三言語 PDF は Releases の ZIP を展開して使用してください。以下のパスは展開したリリースパッケージを基準とします。

## 中文

1. 解压完整发布包，保留目录结构；先关闭所有 AE，再双击 `Apply_Template_Asset_Settings.bat`。工具备份并直接修改用户目录中的配置文件，不启动 AE。
2. 将 `04_Script/AEP_Template_Import_Tool.jsx` 放入 AE 的 `Scripts/ScriptUI Panels`，完成配置后启动 AE，从“窗口”打开。
3. 选择 `Sample / 01 / 001 / t01`，点击“新建”。`2_AEP` 和 `Render` 是输出目录，初始为空。
4. 文字说明：`03_Documentation/AEP-Template-Import-Tool_Guide_zh-en-ja.pdf`，按中文、English、日本語排列。

## English

Extract the complete release. Close all AE instances, then run `Apply_Template_Asset_Settings.bat en` to back up and directly edit the local preference files. AE is never launched by this utility. Install the JSX in AE's `Scripts/ScriptUI Panels`, restart AE, and open it from Window. Start AE after applying settings. Select `Sample / 01 / 001 / t01` and click New. The `2_AEP` and `Render` output folders start empty.

## 日本語

全体を展開し、すべての AE を終了してから `Apply_Template_Asset_Settings.bat ja` を実行します。設定ファイルをバックアップして直接編集します。AE は起動しません。JSXをAEの `Scripts/ScriptUI Panels` に配置し、AEを再起動して「ウィンドウ」から開きます。設定適用後に AE を起動してください。`Sample / 01 / 001 / t01` を選び「新規」をクリックします。`2_AEP` と `Render` は初期状態では空の出力先です。

## Release files

- `01_Videos/`: final MP4 with burned-in subtitles; zh-CN, en, ja
- `02_Template_Assets/`: reusable folder structure, PNG sequence, LO image, layered PSD and template AEP
- `AEP-Template-Import-Tool_Template-Assets.zip`: standalone assets plus the same configuration utility
- `Apply_Template_Asset_Settings.bat`, `Tools/`: portable configuration utility; no Python or admin rights needed for configuration
- `03_Documentation/`: concise trilingual PDF
- `04_Script/`: matching production JSX with English Cut terminology
- `SHA256SUMS.txt`, `RELEASE_MANIFEST.json`: checksums and provenance

## 独立配置工具 / Standalone configuration utility / 設定ツール

`Apply_Template_Asset_Settings.bat` 由用户自行选择运行，用来把 AE 内保存的脚本设置改为与本包素材一致。共配置 42 项：素材根目录和模板路径、作品/集数/卡号/版本、磁盘和 AE 内目录映射、复制模式、识别后缀和命名规则。配置路径根据解压位置计算，原值先备份。视频和脚本不会自动调用它。

Optional: run the BAT yourself to apply the bundled asset configuration. It backs up the original values, then writes 42 local settings. It is never run automatically by the videos or tool.

BAT はユーザーが必要に応じて手動で実行する設定ツールです。元の値をバックアップして、本素材に対応する 42 項目を保存します。動画やスクリプトから自動実行されることはありません。

## Configuration

The configuration utility directly edits `%APPDATA%/Adobe/After Effects/<version>/Adobe After Effects <version> Prefs.txt`, in the `["Settings_AEPTemplateImportToolSettingsV4"]` section used by `app.settings`. It never starts or closes AE. **Close all AE instances first**, run the BAT, then start AE and open the panel. An open AE instance can retain old settings and overwrite edits when it exits; the utility refuses to write while AE is running.

All existing initialized AE version folders are configured. Missing version preferences are not created; start and close AE manually once if none exist. Only the 42 bundled keys are changed; other settings, encoding and line endings are preserved. Full preference-file backups and results are stored in `Settings_Backups/`. Keep these backups private. To restore, close AE and copy the matching `.bak` over the original preference file shown in the result log.

Paths are resolved from the extracted package; rerun the BAT after moving it. To target one specific preference file, run the PowerShell helper with `-PreferencesFile "C:\...\Adobe After Effects 26.0 Prefs.txt"`. `-DryRun` validates without writing. No AE executable, scripting permission or Python is required to apply configuration. The template itself was saved with AE 2026 and requires a compatible AE version.

中文：先关闭全部 AE。BAT 直接修改 AppData 中的脚本设置段，不启动 AE；完成后再开 AE。若已有多个 AE 版本配置，会分别更新并备份。其他设置保持不变。

日本語：すべての AE を終了してから実行してください。AppData の設定ファイルを直接編集し、AE は起動しません。複数の初期化済みバージョンは個別に更新・バックアップします。完了後に AE を起動してください。

Configuration does not install the script, open or save a project, enqueue a job, or start rendering. The AErender application shown in the videos is a separate dependency. Script installation under Program Files may require administrator access. For GitHub Releases, upload the complete release ZIP; the PDF, videos and standalone assets ZIP may also be uploaded separately.

## License / 许可 / ライセンス

Copyright (C) 2026 yuzhou-2023@foxmail.com

软件采用 **GPL-3.0-only**：允许商用，修改后再分发须按 GPL 提供对应源码并保留版权声明。完整条款见 `LICENSE`，三语范围说明见 `LICENSE_INFO.md`。

Software: **GPL-3.0-only**. Commercial use is permitted; redistributed modifications must comply with GPL source and notice requirements. See `LICENSE` and `LICENSE_INFO.md`.

ソフトウェアは **GPL-3.0-only** です。商用利用が可能で、改変版の配布時には GPL のソース提供・表示義務を守る必要があります。`LICENSE` と `LICENSE_INFO.md` を参照してください。

## TP import and F5 / TP 导入与 F5 / TP 読み込みと F5

- 中文：TP 动画序列导入后固定解释为 24 fps。主面板内按 F5，从当前已保存的 AEP 名称刷新作品、集数、卡号和版本；无已保存工程或无法完整识别时保持原显示。快捷键生效范围与 Enter、Ctrl+S 相同。
- English: Imported TP animation sequences are interpreted at 24 fps. Press F5 within the main panel to refresh Show, Episode, Cut and Version from the current saved AEP name. With no saved project or an unrecognizable name, nothing changes. F5 uses the same keyboard scope as Enter and Ctrl+S.
- 日本語：TP の動画シーケンスは読み込み後に 24 fps で解釈します。メインパネル内で F5 を押すと、保存済みの現在の AEP 名から作品・話数・カット・バージョンを更新します。未保存または正しく識別できない場合は変更しません。Enter、Ctrl+S と同じ範囲で有効です。
