// Copyright (C) 2026 yuzhou-2023@foxmail.com
// SPDX-License-Identifier: GPL-3.0-only
//
// This program is free software: you can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, version 3 of the License only.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. See LICENSE, or AEP_Template_Import_Tool_LICENSE.txt.
// If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

// AE Template Import Tool — customizable output names
// Create/open shot AEP files and import related Cell/BG assets.

(function AEPTemplateImportTool(thisObj) {
    var SCRIPT_NAME = "AEP Template Import Tool";
    var SCRIPT_VERSION = "6.6";
    // QR data includes a four-module quiet zone; regenerate when PROJECT_URL changes.
    var PROJECT_URL = "https://github.com/0living0/AEP-Template-Import-Tool";
    var PROJECT_QR_ROWS = ["00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00001111111000011101111110010011111110000", "00001000001001100111110000100010000010000", "00001011101011010101011011100010111010000", "00001011101011100011100100101010111010000", "00001011101010010001011001110010111010000", "00001000001011110011101000001010000010000", "00001111111010101010101010101011111110000", "00000000000010011011000011001000000000000", "00001011111001011011010100000011111000000", "00000011010011111011100111010011011010000", "00000111101000011001101000001100101100000", "00000011000110001010100001001000111000000", "00000111001011100000001000110100110100000", "00000001000110000011100110110010011110000", "00000110101001101110010010100110011100000", "00000111110111101110101111000111011000000", "00001100101001110110010110111101100010000", "00000001100110000100011101010011011100000", "00000100011110010111010011101101101100000", "00000111110110001011011111000101111100000", "00001011101100001001100100001001110110000", "00001111000001110011011111010010010010000", "00001011001010111111101010000101011100000", "00001011100101110101000111101110111000000", "00001001001101011111110100111111110100000", "00000000000010000100001100011000101010000", "00001111111000111101101011111010101000000", "00001000001011111110100011111000111000000", "00001011101010010001001101101111110000000", "00001011101011001011110110111100101110000", "00001011101011110110010000100011001000000", "00001000001000010010101011101110111000000", "00001111111011001010010000111101000100000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000", "00000000000000000000000000000000000000000"];

    function addProjectQr(parent) {
        var qrSize = PROJECT_QR_ROWS.length * 4;
        var qrControl = parent.add("panel", undefined, "", { borderStyle: "none" });
        qrControl.alignment = ["center", "top"];
        qrControl.minimumSize = [qrSize, qrSize];
        qrControl.maximumSize = [qrSize, qrSize];
        qrControl.preferredSize = [qrSize, qrSize];
        qrControl.helpTip = PROJECT_URL;
        qrControl.onDraw = function () {
            var graphics = this.graphics;
            var white = graphics.newBrush(graphics.BrushType.SOLID_COLOR, [1, 1, 1, 1]);
            var black = graphics.newBrush(graphics.BrushType.SOLID_COLOR, [0, 0, 0, 1]);
            graphics.newPath();
            graphics.rectPath(0, 0, qrSize, qrSize);
            graphics.fillPath(white);
            for (var y = 0; y < PROJECT_QR_ROWS.length; y++) {
                var row = PROJECT_QR_ROWS[y];
                var x = 0;
                while (x < row.length) {
                    if (row.charAt(x) !== "1") { x++; continue; }
                    var start = x;
                    while (x < row.length && row.charAt(x) === "1") { x++; }
                    graphics.newPath();
                    graphics.rectPath(start * 4, y * 4, (x - start) * 4, 4);
                    graphics.fillPath(black);
                }
            }
        };
        parent.add("statictext", undefined, PROJECT_URL);
        return qrControl;
    }
    var SETTINGS_SECTION = "AEPTemplateImportToolSettingsV4";
    var LEGACY_SETTINGS_SECTION = "AEPTemplateImportToolSettings";

    var SETTINGS_KEYS = {
        presetRootPath: "presetRootPath",
        templateAepPath: "templateAepPath",
        tpFolderName: "tpFolderName",
        bgFolderName: "bgFolderName",
        aepFolderName: "aepFolderName",
        cellFolderName: "cellFolderName",
        bgProjectFolderName: "bgProjectFolderName",
        outputFolderName: "outputFolderName",
        targetCompName: "targetCompName",
        sequenceExtensions: "sequenceExtensions",
        excludedFolderNames: "excludedFolderNames",
        lastShowName: "lastShowName",
        lastEpisodeName: "lastEpisodeName",
        lastCardName: "lastCardName",
        lastTakeName: "lastTakeName",
        language: "language",
        localRender: "localRender",
        remoteAerenderPath: "remoteAerenderPath",
        createIndependentProject: "createIndependentProject",
        cutTpFiles: "cutTpFiles",
        copyTpFiles: "copyTpFiles",
        cutBgFiles: "cutBgFiles",
        copyBgFiles: "copyBgFiles",
        outputNameOrder: "outputNameOrder",
        outputNameShowPattern: "outputNameShowPattern",
        outputNameEpisodePattern: "outputNameEpisodePattern",
        outputNameCardPattern: "outputNameCardPattern",
        outputNameVersionPattern: "outputNameVersionPattern",
        outputNameSeparator: "outputNameSeparator"
    };


    var LANGUAGE_OPTIONS = ["zh", "en", "ja"];
    function languageIndexOf(value) {
        for (var i = 0; i < LANGUAGE_OPTIONS.length; i++) if (LANGUAGE_OPTIONS[i] === value) return i;
        return -1;
    }
    var LANGUAGE_LABELS = { zh: "中文", en: "English", ja: "日本語" };
    var LANGUAGE_TEXT = {
        "基础设置": { en: "Basic Settings", ja: "基本設定" },
        "高级设置": { en: "Advanced Settings", ja: "詳細設定" },
        "说明": { en: "Instructions", ja: "説明" },
        "作者：yuzhou-2023@foxmail.com（Copyright (C) 2026）": { en: "Copyright (C) 2026 yuzhou-2023@foxmail.com", ja: "作者：yuzhou-2023@foxmail.com（Copyright (C) 2026）" },
        "使用和修改请遵守协议：GPL-3.0-only": { en: "GNU GPL v3 only (GPL-3.0-only)", ja: "利用・改変は GPL-3.0-only に従ってください" },
        "新建设置": { en: "New Project Settings", ja: "新規作成設定" },
        "同时创建新独立工程文件到AEP文件夹": { en: "Create a separate project folder in the AEP folder", ja: "AEPフォルダー内に独立した新規プロジェクトフォルダーを作成" },
        "剪切TP文件": { en: "Move TP files", ja: "TPファイルを移動" },
        "复制TP文件": { en: "Copy TP files", ja: "TPファイルをコピー" },
        "剪切BG文件": { en: "Move BG files", ja: "BGファイルを移動" },
        "复制BG文件": { en: "Copy BG files", ja: "BGファイルをコピー" },
        "磁盘目录设置": { en: "Disk Folder Settings", ja: "ディスクフォルダー設定" },
        "AE 项目设置": { en: "AE Project Settings", ja: "AEプロジェクト設定" },
        "磁盘目录以当前剧名·集数对应目录为根目录。": { en: "Disk folders start from the directory for the current show and episode.", ja: "ディスクフォルダーは現在の作品・話数のディレクトリをルートにします。" },
        "用于导入动画和 LO 素材。": { en: "Used to import animation and LO assets.", ja: "動画素材とLO素材の読み込みに使用します。" },
        "用于导入动画素材。": { en: "Used to import animation assets.", ja: "動画素材の読み込みに使用します。" },
        "用于导入 LO 素材；留空时从 TP 文件夹查找。": { en: "Used to import LO assets; when empty, searches the TP folder.", ja: "LO素材の読み込みに使用します。空欄の場合はTPフォルダーを検索します。" },
        "用于导入美术背景素材。": { en: "Used to import background art assets.", ja: "美術背景素材の読み込みに使用します。" },
        "用于保存 AE 工程 AEP 的文件夹。": { en: "Folder used to save AE project AEP files.", ja: "AEプロジェクトのAEPファイルを保存するフォルダーです。" },
        "用于保存渲染输出文件。": { en: "Folder used to save rendered output files.", ja: "レンダー出力ファイルを保存するフォルダーです。" },
        "用于放置导入后的动画序列的项目文件夹。": { en: "Project folder for imported animation sequences.", ja: "読み込んだ動画シーケンスを配置するプロジェクトフォルダーです。" },
        "用于放置导入后的 LO 素材的项目文件夹。": { en: "Project folder for imported LO assets.", ja: "読み込んだLO素材を配置するプロジェクトフォルダーです。" },
        "用于放置导入后的美术背景素材的项目文件夹。": { en: "Project folder for imported background art assets.", ja: "読み込んだ美術背景素材を配置するプロジェクトフォルダーです。" },
        "用于放置导入的参考 AEP。": { en: "Project folder for imported reference AEP files.", ja: "読み込んだ参考AEPを配置するプロジェクトフォルダーです。" },
        "用于指示最终输出合成所在的项目文件夹。": { en: "Project folder containing the final output comp.", ja: "最終出力コンポがあるプロジェクトフォルダーです。" },
        "用于指定所有素材导入后放入时间线的合成。": { en: "Comp whose timeline receives all imported assets.", ja: "読み込んだすべての素材をタイムラインへ配置するコンポです。" },
        "导入动画序列时可接受的文件后缀名。": { en: "Accepted file extensions for imported animation sequences.", ja: "動画シーケンスの読み込みで受け付けるファイル拡張子です。" },
        "避免误导入素材的排除文件夹关键词。": { en: "Folder keywords excluded to prevent unintended asset imports.", ja: "素材の誤読み込みを防ぐ除外フォルダーのキーワードです。" },
        "设置": { en: "Settings", ja: "設定" },
        "预设根目录": { en: "Preset Root", ja: "プリセットルート" },
        "模板 AEP": { en: "Template AEP", ja: "テンプレート AEP" },
        "语言": { en: "Language", ja: "言語" },
        "输出名称设置": { en: "Output Name Settings", ja: "出力名設定" },
        "剧名": { en: "Show", ja: "作品名" },
        "集数": { en: "Episode", ja: "話数" },
        "卡号": { en: "Cut", ja: "カット" },
        "版本": { en: "Version", ja: "バージョン" },
        "块间隔符": { en: "Separator", ja: "区切り文字" },
        "预览": { en: "Preview", ja: "プレビュー" },
        "点击两个按钮可互换位置。": { en: "Click two buttons to swap their positions.", ja: "2つのボタンをクリックすると位置が入れ替わります。" },
        "空白→保留原值\n文字→替换原值\n+→插入原值\n++→输入普通加号\n例：集数输入“AA+BB”→“AA集数BB”": { en: "Blank → keep the original value\nText → replace the original value\n+ → insert the original value\n++ → insert a literal plus sign\nExample: for Episode, 'AA+BB' → 'AAEpisodeBB'", ja: "空欄 → 元の値を保持\n文字 → 元の値を置換\n+ → 元の値を挿入\n++ → 通常のプラス記号を入力\n例：話数に「AA+BB」→「AA話数BB」" },
        "本机渲染": { en: "Render on this computer", ja: "このPCでレンダー" },
        "他机aerender地址": { en: "Remote AErender path", ja: "他PCのAErenderパス" },
        "保存": { en: "Save", ja: "保存" },
        "参考": { en: "Reference", ja: "参照" },
        "取消": { en: "Cancel", ja: "キャンセル" },
        "浏览": { en: "Browse", ja: "参照" },
        "选择": { en: "Choose ", ja: "選択：" },
        "打开": { en: "Open", ja: "開く" },
        "新建": { en: "New", ja: "新規" },
        "确定": { en: "OK", ja: "決定" },
        "添加": { en: "Add", ja: "追加" },
        "AErender": { en: "AErender", ja: "AErender" },
        "剧名·集数": { en: "Show · Episode", ja: "作品・話数" },
        "卡号·版本": { en: "Cut · Take", ja: "カット・テイク" },
        "目标合成": { en: "Target Comp", ja: "対象コンポ" },
        "序列后缀": { en: "Sequence Extensions", ja: "連番拡張子" },
        "排除文件夹": { en: "Excluded Folders", ja: "除外フォルダー" },
        "TP 文件夹": { en: "TP Folder", ja: "TP フォルダー" },
        "LO 文件夹": { en: "LO Folder", ja: "LO フォルダー" },
        "BG 文件夹": { en: "BG Folder", ja: "BG フォルダー" },
        "AEP 文件夹": { en: "AEP Folder", ja: "AEP フォルダー" },
        "Render 文件夹": { en: "Render Folder", ja: "Render フォルダー" },
        "Cell 目标文件夹": { en: "Cell Target Folder", ja: "Cell 対象フォルダー" },
        "BG 目标文件夹": { en: "BG Target Folder", ja: "BG 対象フォルダー" },
        "Sample 文件夹": { en: "Sample Folder", ja: "Sample フォルダー" },
        "Output 文件夹": { en: "Output Folder", ja: "Output フォルダー" },
        "TP 放置文件夹": { en: "TP Location Folder", ja: "TP配置フォルダー" },
        "LO 放置文件夹": { en: "LO Location Folder", ja: "LO配置フォルダー" },
        "BG 放置文件夹": { en: "BG Location Folder", ja: "BG配置フォルダー" },
        "AEP 放置文件夹": { en: "AEP Location Folder", ja: "AEP配置フォルダー" },
        "Render 放置文件夹": { en: "Render Location Folder", ja: "Render配置フォルダー" },
        "Cell 放置文件夹": { en: "Cell Location Folder", ja: "Cell配置フォルダー" },
        "Sample 放置文件夹": { en: "Sample Location Folder", ja: "Sample配置フォルダー" },
        "Output 放置文件夹": { en: "Output Location Folder", ja: "Output配置フォルダー" },
        "AE 目录从当前项目根目录开始；＋进入所选目录的下一层。": { en: "AE folders start at the project root; + enters the next level.", ja: "AEフォルダーはプロジェクトルートから開始します。＋で次の階層へ進みます。" },
        "添加下一层目录选择": { en: "Add the next folder level", ja: "次のフォルダー階層を追加" },
        "删除最下一级，使用上一级作为目标": { en: "Remove the last level and use the parent as target", ja: "最後の階層を削除して親を対象にする" },
        "— 选择目标 —": { en: "— Select target —", ja: "— 対象を選択 —" },
        "— 在TP中查找 —": { en: "— Search in TP —", ja: "— TP内を検索 —" },
        "  [合成]": { en: "  [Comp]", ja: "  [コンポ]" },
        "已保存的目标当前不在浏览目录中；未修改时会保留原设置。": { en: "The saved target is unavailable; it will be kept until changed.", ja: "保存された対象が見つかりません。変更するまで保持します。" },
        "已启用：": { en: "Enabled: ", ja: "有効：" },
        "无": { en: "None", ja: "なし" },
        "+ 添加自定义…": { en: "+ Add custom…", ja: "+ カスタム追加…" },
        "输入一个项目：": { en: "Enter one item:", ja: "項目を1つ入力：" },
        "未设置": { en: "Not set", ja: "未設定" },
        "未找到": { en: "Not found", ja: "見つかりません" },
        "请先选择剧名。": { en: "Choose a show first.", ja: "作品を先に選択してください。" },
        "请先选择集数。": { en: "Choose an episode first.", ja: "話数を先に選択してください。" },
        "请先输入卡号。": { en: "Enter a cut number first.", ja: "カット番号を入力してください。" },
        "请先输入版本。": { en: "Enter a take first.", ja: "テイクを入力してください。" },
        "请先在设置里填写预设根目录。": { en: "Set the preset root in Settings first.", ja: "設定でプリセットルートを指定してください。" },
        "请先在设置里填写模板 AEP 路径。": { en: "Set the template AEP path in Settings first.", ja: "設定でテンプレートAEPのパスを指定してください。" },
        "当前工程还没有 AEP 文件路径。": { en: "The current project has no AEP file path.", ja: "現在のプロジェクトにはAEPファイルパスがありません。" },
        "没有找到可打开的 AEP 文件。": { en: "No AEP file was found.", ja: "開けるAEPファイルが見つかりません。" },
        "没有找到对应工程。": { en: "The corresponding project was not found.", ja: "対応するプロジェクトが見つかりません。" },
        "工程已存在": { en: "Existing Project", ja: "既存プロジェクト" },
        "工程已存在，是否直接打开最新版本？": { en: "A project exists. Open the latest version?", ja: "プロジェクトが存在します。最新バージョンを開きますか？" },
        "选择 TP 文件夹": { en: "Choose TP Folder", ja: "TPフォルダーを選択" },
        "找到多个匹配文件夹，请选择一个：": { en: "Multiple matching folders were found. Choose one:", ja: "一致するフォルダーが複数見つかりました。1つ選択してください：" },
        "没有找到匹配卡号的 TP 文件夹。": { en: "No TP folder matched the cut number.", ja: "カット番号に一致するTPフォルダーがありません。" },
        "没有找到可导入的图片序列。": { en: "No image sequence was found to import.", ja: "読み込める画像シーケンスが見つかりません。" },
        "没有找到 BG 文件夹:": { en: "BG folder not found:", ja: "BGフォルダーが見つかりません：" },
        "没有找到匹配卡号的 PSD 文件。": { en: "No matching PSD file was found.", ja: "カット番号に一致するPSDファイルが見つかりません。" },
        "没有找到匹配卡号且名称含有 LO 的文件。": { en: "No file matched the cut number and contained LO in its name.", ja: "カット番号に一致し、名前にLOを含むファイルが見つかりません。" },
        "找不到目标合成，请在高级设置选择目标合成。": { en: "Target comp not found. Choose it in Advanced Settings.", ja: "対象コンポが見つかりません。詳細設定で選択してください。" },
        "请在高级设置选择 Cell 目标文件夹。": { en: "Choose the Cell target folder in Advanced Settings.", ja: "詳細設定でCell対象フォルダーを選択してください。" },
        "请在高级设置选择 BG 目标文件夹。": { en: "Choose the BG target folder in Advanced Settings.", ja: "詳細設定でBG対象フォルダーを選択してください。" },
        "请在高级设置选择 LO 放置文件夹。": { en: "Choose the LO location folder in Advanced Settings.", ja: "詳細設定でLO配置フォルダーを選択してください。" },
        "请在高级设置选择 Sample 文件夹。": { en: "Choose the Sample folder in Advanced Settings.", ja: "詳細設定でSampleフォルダーを選択してください。" },
        "请在高级设置选择 Cell 放置文件夹。": { en: "Choose the Cell location folder in Advanced Settings.", ja: "詳細設定でCell配置フォルダーを選択してください。" },
        "请在高级设置选择 BG 放置文件夹。": { en: "Choose the BG location folder in Advanced Settings.", ja: "詳細設定でBG配置フォルダーを選択してください。" },
        "请在高级设置选择 Sample 放置文件夹。": { en: "Choose the Sample location folder in Advanced Settings.", ja: "詳細設定でSample配置フォルダーを選択してください。" },
        "继续另存为": { en: "Continue Save As", ja: "名前を付けて保存を続行" },
        "集数名称中没有找到数字: ": { en: "No number was found in the episode name: ", ja: "話数名に数字が見つかりません：" },
        "当前 AEP 名称无法解析": { en: "The current AEP name cannot be parsed", ja: "現在のAEP名を解析できません" },
        "剧名: ": { en: "Show: ", ja: "作品：" },
        "集数: ": { en: "Episode: ", ja: "話数：" },
        "卡号: ": { en: "Cut: ", ja: "カット：" },
        "无法复制已完成的渲染队列任务。": { en: "The completed render queue item could not be duplicated.", ja: "完了したレンダーキュー項目を複製できません。" },
        "模板 AEP 不存在:\n": { en: "The template AEP does not exist:\n", ja: "テンプレートAEPが存在しません：\n" },
        "无法创建 AEP 文件夹:\n": { en: "The AEP folder could not be created:\n", ja: "AEPフォルダーを作成できません：\n" },
        "复制模板 AEP 失败:\n": { en: "Failed to copy the template AEP:\n", ja: "テンプレートAEPのコピーに失敗しました：\n" },
        "无法创建素材目录:\n": { en: "Could not create the asset folder:\n", ja: "素材フォルダーを作成できません：\n" },
        "复制素材失败:\n": { en: "Failed to copy the asset:\n", ja: "素材のコピーに失敗しました：\n" },
        "删除源素材失败:\n": { en: "Failed to remove the source asset:\n", ja: "元素材を削除できません：\n" },
        "当前 AEP 和输入信息不一致:": { en: "The current AEP does not match the entered information:", ja: "現在のAEPと入力情報が一致しません：" },
        "目标: ": { en: "Target: ", ja: "対象：" },
        "信息不一致": { en: "Information Mismatch", ja: "情報の不一致" },
        "目标已存在": { en: "Target Already Exists", ja: "対象は既に存在します" },
        "目标 AEP 已存在:": { en: "The target AEP already exists:", ja: "対象AEPは既に存在します：" },
        "是否继续另存为？": { en: "Continue Save As?", ja: "名前を付けて保存を続行しますか？" },
        "请先打开 AE 工程。": { en: "Open an AE project first.", ja: "先にAEプロジェクトを開いてください。" },
        "目标路径存在同名项目，请先重命名后重新选择：": { en: "Duplicate names exist in the target path. Rename them and choose again: ", ja: "対象パスに同名項目があります。名前を変更して再選択してください：" },
        "找不到设置目标，请在高级设置重新选择：": { en: "The configured target was not found. Choose it again in Advanced Settings: ", ja: "設定した対象が見つかりません。詳細設定で再選択してください：" },
        "请选择完整的“": { en: "Select a complete “", ja: "「" },
        "”目标。": { en: "” target.", ja: "」の対象を最後まで選択してください。" },
        "“目标合成”请选择合成；可点击＋继续进入下级目录。": { en: "Choose a comp for Target Comp; click + to enter the next folder level.", ja: "対象コンポにはコンポを選択してください。＋で次のフォルダー階層へ進めます。" },
        "同级存在同名目标：": { en: "Duplicate target names exist at this level: ", ja: "同じ階層に同名の対象があります：" },
        "。请先重命名后再选择。": { en: ". Rename them before choosing again.", ja: "。名前を変更してから再選択してください。" },
        "请输入一个有效项目，不要包含逗号或路径分隔符。": { en: "Enter one valid item without commas or path separators.", ja: "カンマやパス区切りを含まない有効な項目を入力してください。" },
        "将当前已保存的 AE 工程加入 AEP Render 队列；请先打开渲染器。": { en: "Add the saved AE project to the AEP Render queue; open the renderer first.", ja: "保存済みAEプロジェクトをAEP Renderキューへ追加します。先にレンダーを開いてください。" },
        "请打开AErender": { en: "Please open AErender.", ja: "AErenderを開いてください。" },
        "无法写入请求；请检查 AE 脚本文件访问权限。": { en: "The request could not be written. Check AE script file access permissions.", ja: "リクエストを書き込めません。AEスクリプトのファイルアクセス権限を確認してください。" },
        "无法提交请求。": { en: "The request could not be submitted.", ja: "リクエストを送信できません。" },
        "请打开AErender\n等待响应超时，请先检查队列，避免重复提交。": { en: "Please open AErender.\nThe response timed out. Check the queue before submitting again.", ja: "AErenderを開いてください。\n応答がタイムアウトしました。重複送信を避けるためキューを確認してください。" },
        "无法读取响应。": { en: "The response could not be read.", ja: "応答を読み取れません。" },
        "没有可保存的 AE 工程。": { en: "There is no AE project to save.", ja: "保存できるAEプロジェクトがありません。" },
        "工程未保存成功或已取消保存，未发送到 AErender。": { en: "The project was not saved or saving was canceled, so it was not sent to AErender.", ja: "プロジェクトが保存されなかったか保存がキャンセルされたため、AErenderへ送信していません。" },
        "渲染器返回的入队结果无效。": { en: "AErender returned an invalid queue result.", ja: "AErenderから無効なキュー結果が返されました。" },
        " 成功加入队列": { en: " added to queue", ja: " をキューに追加しました" },
        "将导入素材放入合成": { en: "Place Imported Assets in Comp", ja: "読み込んだ素材をコンポに配置" },
        "导入镜头素材": { en: "Import Shot Assets", ja: "カット素材を読み込み" },
        " 已在队列中": { en: " is already in the queue", ja: " は既にキューにあります" },
        "可以右键单击脚本UI空白区域打开设置": { en: "Right-click a blank area of the script UI to open Settings.", ja: "スクリプトUIの空白部分を右クリックすると設定を開けます。" },
        "导入参考工程": { en: "Import Reference Project", ja: "参考プロジェクトを読み込み" },
        "导入提示": { en: "Import Notice", ja: "読み込み通知" },
        "关闭": { en: "Close", ja: "閉じる" },
        " 已导入参考文件夹": { en: " imported into the reference folder", ja: " を参考フォルダーに読み込みました" },
        "他机 AErender 地址未设置。": { en: "The remote AErender path is not set.", ja: "他PCのAErenderパスが設定されていません。" },
        "找不到他机 AErender 请求目录：": { en: "Remote AErender request folder not found: ", ja: "他PCのAErenderリクエストフォルダーが見つかりません：" }
    };
    function T(text) {
        var language = config.language || "zh";
        return language === "zh" ? text : (LANGUAGE_TEXT[text] && LANGUAGE_TEXT[text][language]) || text;
    }

    var config = {
        presetRootPath: "",
        templateAepPath: "",
        tpFolderName: "1_TP",
        bgFolderName: "2_BG",
        aepFolderName: "2_AEP",
        cellFolderName: "2_Cell",
        bgProjectFolderName: "3_Bg",
        outputFolderName: "3_Output",
        targetCompName: "1_Comp",
        sequenceExtensions: "png,tga",
        excludedFolderNames: "old,go",
        lastShowName: "",
        lastEpisodeName: "",
        lastCardName: "",
        lastTakeName: "t01",
        language: "zh",
        localRender: "true",
        remoteAerenderPath: "",
        createIndependentProject: "false",
        cutTpFiles: "false",
        copyTpFiles: "true",
        cutBgFiles: "false",
        copyBgFiles: "true",
        loFolderName: "",
        outputNameOrder: "show,episode,card,version",
        outputNameShowPattern: "",
        outputNameEpisodePattern: "",
        outputNameCardPattern: "",
        outputNameVersionPattern: "",
        outputNameSeparator: "_"
    };


    // Every target stores its complete path from the selected disk root or AE project root.
    var targetKeys = ["tpFolderName", "loFolderName", "bgFolderName", "aepFolderName", "renderFolderName", "loProjectFolderName", "cellFolderName", "bgProjectFolderName", "sampleFolderName", "outputFolderName", "targetCompName"];
    for (var targetIndex = 0; targetIndex < targetKeys.length; targetIndex++) {
        SETTINGS_KEYS["target_" + targetKeys[targetIndex]] = "target_" + targetKeys[targetIndex];
        config["target_" + targetKeys[targetIndex]] = "";
    }
    SETTINGS_KEYS.options_sequenceExtensions = "options_sequenceExtensions";
    SETTINGS_KEYS.options_excludedFolderNames = "options_excludedFolderNames";
    config.options_sequenceExtensions = "png,tga";
    config.options_excludedFolderNames = "old,go";

    function hasSetting(key) {
        return app.settings.haveSetting(SETTINGS_SECTION, key);
    }

    function getSetting(key, defaultValue) {
        if (hasSetting(key)) return app.settings.getSetting(SETTINGS_SECTION, key);
        if (app.settings.haveSetting(LEGACY_SETTINGS_SECTION, key)) return app.settings.getSetting(LEGACY_SETTINGS_SECTION, key);
        return defaultValue;
    }

    function saveSetting(key, value) {
        app.settings.saveSetting(SETTINGS_SECTION, key, value);
    }

    function loadConfig() {
        for (var key in SETTINGS_KEYS) {
            if (SETTINGS_KEYS.hasOwnProperty(key)) {
                config[key] = getSetting(SETTINGS_KEYS[key], config[key]);
            }
        }
    }

    function saveConfig() {
        for (var key in SETTINGS_KEYS) {
            if (SETTINGS_KEYS.hasOwnProperty(key)) {
                saveSetting(SETTINGS_KEYS[key], config[key]);
            }
        }
    }

    function settingEnabled(value) {
        return value === true || String(value).toLowerCase() === "true";
    }

    var nonModalNoticeWindows = [];
    function appendImportWarning(warnings, message) {
        for (var i = 0; i < warnings.length; i++) if (warnings[i] === message) return;
        warnings.push(message);
    }

    function showImportWarnings(warnings) {
        if (!warnings || warnings.length === 0) return;
        var notice = new Window("palette", T("导入提示"), undefined, { closeButton: true });
        notice.orientation = "column";
        notice.alignChildren = ["fill", "top"];
        notice.margins = 14;
        var message = notice.add("statictext", undefined, warnings.join("\n\n"), { multiline: true });
        message.preferredSize = [520, Math.min(260, Math.max(50, warnings.length * 42))];
        var closeButton = notice.add("button", undefined, T("关闭"));
        closeButton.alignment = ["right", "center"];
        closeButton.onClick = function () { notice.close(); };
        notice.onClose = function () {
            for (var i = nonModalNoticeWindows.length - 1; i >= 0; i--) if (nonModalNoticeWindows[i] === notice) nonModalNoticeWindows.splice(i, 1);
        };
        nonModalNoticeWindows.push(notice);
        notice.center();
        notice.show();
    }

    function trimText(text) {
        return String(text).replace(/^\s+|\s+$/g, "");
    }

    function normalizeSlashes(pathText) {
        return String(pathText).replace(/\\/g, "/");
    }

    function joinPath(basePath, childName) {
        if (!basePath || !childName) {
            return basePath || childName || "";
        }
        var cleanBase = String(basePath).replace(/[\\\/]+$/g, "");
        var cleanChild = String(childName).replace(/^[\\\/]+/g, "");
        return cleanBase + "/" + cleanChild;
    }

    function splitCsv(text) {
        var result = [];
        var parts = String(text).split(",");
        for (var i = 0; i < parts.length; i++) {
            var item = trimText(parts[i]);
            if (item !== "") {
                result.push(item);
            }
        }
        return result;
    }

    function arrayContainsLower(items, value) {
        var target = String(value).toLowerCase();
        for (var i = 0; i < items.length; i++) {
            if (String(items[i]).toLowerCase() === target) {
                return true;
            }
        }
        return false;
    }

    function arrayHasKeywordInText(items, value) {
        var target = String(value).toLowerCase();
        for (var i = 0; i < items.length; i++) {
            var keyword = String(items[i]).toLowerCase();
            if (keyword !== "" && target.indexOf(keyword) !== -1) {
                return true;
            }
        }
        return false;
    }

    function sanitizeFileName(text) {
        return trimText(text).replace(/[\\\/:\*\?"<>\|]/g, "_");
    }

    function getFolders(folder) {
        var result = [];
        if (!folder || !folder.exists) {
            return result;
        }
        var items = folder.getFiles();
        for (var i = 0; i < items.length; i++) {
            if (items[i] instanceof Folder) {
                result.push(items[i]);
            }
        }
        result.sort(function (a, b) {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        });
        return result;
    }

    function getFolderNames(folder) {
        var folders = getFolders(folder);
        var names = [];
        for (var i = 0; i < folders.length; i++) {
            names.push(decodeURI(folders[i].name));
        }
        return names;
    }

    function selectDropdownItem(dropdown, text) {
        if (!dropdown || !text) {
            return false;
        }
        for (var i = 0; i < dropdown.items.length; i++) {
            if (dropdown.items[i].text === text) {
                dropdown.selection = dropdown.items[i];
                return true;
            }
        }
        return false;
    }

    function resetDropdown(dropdown, items, placeholder) {
        dropdown.removeAll();
        if (!items || items.length === 0) {
            dropdown.add("item", placeholder);
            dropdown.selection = 0;
            return;
        }
        for (var i = 0; i < items.length; i++) {
            dropdown.add("item", items[i]);
        }
        dropdown.selection = 0;
    }

    function getSelectedText(dropdown) {
        if (!dropdown || !dropdown.selection) {
            return "";
        }
        return dropdown.selection.text;
    }

    function matchesLocalizedText(text, sourceText) {
        if (text === sourceText) return true;
        var translations = LANGUAGE_TEXT[sourceText];
        return !!translations && (text === translations.en || text === translations.ja);
    }

    function isPlaceholder(text) {
        return matchesLocalizedText(text, "未设置") || matchesLocalizedText(text, "未找到");
    }

    function saveLastInputs(showName, episodeName, cardName, takeName) {
        if (showName && !isPlaceholder(showName)) {
            config.lastShowName = showName;
            saveSetting(SETTINGS_KEYS.lastShowName, showName);
        }
        if (episodeName && !isPlaceholder(episodeName)) {
            config.lastEpisodeName = episodeName;
            saveSetting(SETTINGS_KEYS.lastEpisodeName, episodeName);
        }
        config.lastCardName = cardName || "";
        saveSetting(SETTINGS_KEYS.lastCardName, config.lastCardName);
        if (takeName !== undefined) {
            config.lastTakeName = takeName || "";
            saveSetting(SETTINGS_KEYS.lastTakeName, config.lastTakeName);
        }
    }

    function saveCurrentInputs(showDropdown, episodeDropdown, cardEdit, takeEdit) {
        saveLastInputs(
            getSelectedText(showDropdown),
            getSelectedText(episodeDropdown),
            trimText(cardEdit.text),
            takeEdit ? trimText(takeEdit.text) : undefined
        );
    }

    function getEpisodeDigits(episodeName) {
        var match = String(episodeName).match(/(\d+)/);
        return match ? match[1] : "";
    }

    function parseTemplateName() {
        var templateFile = new File(config.templateAepPath);
        var baseName = templateFile.displayName || templateFile.name;
        baseName = baseName.replace(/\.aep$/i, "");

        var result = {
            season: "S1",
            take: "t01"
        };

        var match = baseName.match(/_([sS]\d+)E\d+_[^_]+_([tT]\d+)$/);
        if (match) {
            result.season = match[1];
            result.take = match[2];
        }
        return result;
    }

    var OUTPUT_NAME_KEYS = ["show", "episode", "card", "version"];

    function getOutputNameOrder(value) {
        var source = String(value === undefined ? config.outputNameOrder : value).split(",");
        var result = [];
        for (var i = 0; i < source.length; i++) {
            var key = trimText(source[i]);
            var valid = false;
            for (var j = 0; j < OUTPUT_NAME_KEYS.length; j++) if (OUTPUT_NAME_KEYS[j] === key) valid = true;
            var duplicate = false;
            for (var k = 0; k < result.length; k++) if (result[k] === key) duplicate = true;
            if (valid && !duplicate) result.push(key);
        }
        for (var m = 0; m < OUTPUT_NAME_KEYS.length; m++) {
            var found = false;
            for (var n = 0; n < result.length; n++) if (result[n] === OUTPUT_NAME_KEYS[m]) found = true;
            if (!found) result.push(OUTPUT_NAME_KEYS[m]);
        }
        return result;
    }

    function getOutputNamePattern(key, source) {
        var owner = source || config;
        if (key === "show") return owner.outputNameShowPattern || "";
        if (key === "episode") return owner.outputNameEpisodePattern || "";
        if (key === "card") return owner.outputNameCardPattern || "";
        return owner.outputNameVersionPattern || "";
    }

    function applyOutputNamePattern(originalValue, pattern) {
        var source = String(pattern || "");
        if (source === "") return String(originalValue || "");
        var result = "";
        for (var i = 0; i < source.length; i++) {
            if (source.charAt(i) !== "+") {
                result += source.charAt(i);
            } else if (i + 1 < source.length && source.charAt(i + 1) === "+") {
                result += "+";
                i++;
            } else {
                result += String(originalValue || "");
            }
        }
        return result;
    }

    function buildRawShotComponents(showName, episodeName, cardName, takeOverride) {
        var templateParts = parseTemplateName();
        var episodeDigits = getEpisodeDigits(episodeName);
        if (episodeDigits === "") throw new Error(T("集数名称中没有找到数字: ") + episodeName);
        return {
            show: sanitizeFileName(showName),
            episode: templateParts.season + "E" + episodeDigits,
            card: sanitizeFileName(cardName),
            version: sanitizeFileName(takeOverride || templateParts.take)
        };
    }

    function buildOutputName(rawParts, settings, omitVersion) {
        var owner = settings || config;
        var order = getOutputNameOrder(owner.outputNameOrder);
        var separator = sanitizeFileName(owner.outputNameSeparator === undefined ? "_" : owner.outputNameSeparator);
        var values = [];
        for (var i = 0; i < order.length; i++) {
            var key = order[i];
            if (omitVersion && key === "version") continue;
            values.push(sanitizeFileName(applyOutputNamePattern(rawParts[key], getOutputNamePattern(key, owner))));
        }
        return values.join(separator);
    }

    function buildShotName(showName, episodeName, cardName, takeOverride) {
        var templateParts = parseTemplateName();
        var episodeDigits = getEpisodeDigits(episodeName);
        var takeName = takeOverride || templateParts.take;
        if (episodeDigits === "") throw new Error(T("集数名称中没有找到数字: ") + episodeName);
        return sanitizeFileName(showName) + "_" +
            templateParts.season + "E" + episodeDigits + "_" +
            sanitizeFileName(cardName) + "_" +
            sanitizeFileName(takeName);
    }

    function extractTakeFromAepFile(aepFile) {
        if (!aepFile) return "";
        var name = (aepFile.displayName || aepFile.name).replace(/\.aep$/i, "");
        var match = name.match(/_([tT]\d+)$/);
        return match ? match[1] : "";
    }

    function parseShotNameFields(aepFile) {
        if (!aepFile) return null;
        var name = (aepFile.displayName || aepFile.name).replace(/\.aep$/i, "");
        var match = name.match(/^(.*)_([sS]\d+E\d+)_([^_]+)_([tT]\d+)$/);
        if (!match) return null;
        return {
            showName: match[1],
            seasonEpisode: match[2],
            cardName: match[3],
            takeName: match[4],
            baseName: name
        };
    }

    function readCurrentAepInputs() {
        try {
            if (!app.project || !app.project.file || !app.project.file.exists) return null;
            var file = app.project.file;
            if (!/\.aep$/i.test(file.name)) return null;
            var fields = parseShotNameFields(file);
            if (!fields || !trimText(fields.showName) || !trimText(fields.cardName) || !trimText(fields.takeName)) return null;
            var episodeMatch = fields.seasonEpisode.match(/E(\d+)$/);
            if (!episodeMatch) return null;
            var showNames = trimText(config.presetRootPath) ? getFolderNames(new Folder(config.presetRootPath)) : [];
            var showName = fields.showName, showMatches = [];
            for (var i = 0; i < showNames.length; i++) {
                if (sanitizeFileName(showNames[i]) === fields.showName) showMatches.push(showNames[i]);
            }
            if (showMatches.length > 1) return null;
            if (showMatches.length === 1) showName = showMatches[0];
            else showNames.push(showName);
            var episodeNames = trimText(config.presetRootPath) ? getFolderNames(getShowFolder(showName)) : [];
            var episodeName = episodeMatch[1], episodeMatches = [];
            for (var j = 0; j < episodeNames.length; j++) {
                if (getEpisodeDigits(episodeNames[j]) === episodeMatch[1]) episodeMatches.push(episodeNames[j]);
            }
            if (episodeMatches.length > 1) {
                // Prefer the actual enclosing episode folder when digit matches are ambiguous.
                var path = normalizeSlashes(file.fsName).toLowerCase(), pathMatches = [];
                for (var k = 0; k < episodeMatches.length; k++) {
                    var episodePath = normalizeSlashes(getEpisodeFolder(showName, episodeMatches[k]).fsName).replace(/\/$/, "").toLowerCase() + "/";
                    if (path.indexOf(episodePath) === 0) pathMatches.push(episodeMatches[k]);
                }
                if (pathMatches.length !== 1) return null;
                episodeName = pathMatches[0];
            } else if (episodeMatches.length === 1) episodeName = episodeMatches[0];
            else episodeNames.push(episodeName);
            return { showName: showName, episodeName: episodeName, cardName: fields.cardName,
                takeName: fields.takeName, showNames: showNames, episodeNames: episodeNames };
        } catch (readError) {
            return null;
        }
    }

    function buildShotFields(showName, episodeName, cardName, takeName) {
        var templateParts = parseTemplateName();
        var episodeDigits = getEpisodeDigits(episodeName);
        return {
            showName: sanitizeFileName(showName),
            seasonEpisode: templateParts.season + "E" + episodeDigits,
            cardName: sanitizeFileName(cardName),
            takeName: sanitizeFileName(takeName),
            baseName: buildShotName(showName, episodeName, cardName, takeName)
        };
    }

    function collectFieldMismatches(currentFields, targetFields) {
        var mismatches = [];
        if (!currentFields) {
            mismatches.push(T("当前 AEP 名称无法解析"));
            return mismatches;
        }
        if (currentFields.showName !== targetFields.showName) {
            mismatches.push(T("剧名: ") + currentFields.showName + " -> " + targetFields.showName);
        }
        if (currentFields.seasonEpisode !== targetFields.seasonEpisode) {
            mismatches.push(T("集数: ") + currentFields.seasonEpisode + " -> " + targetFields.seasonEpisode);
        }
        if (currentFields.cardName !== targetFields.cardName) {
            mismatches.push(T("卡号: ") + currentFields.cardName + " -> " + targetFields.cardName);
        }
        return mismatches;
    }

    function getShowFolder(showName) {
        return new Folder(joinPath(config.presetRootPath, showName));
    }

    function getEpisodeFolder(showName, episodeName) {
        return new Folder(joinPath(getShowFolder(showName).fsName, episodeName));
    }

    function getWorkFolder(showName, episodeName, folderName) {
        return new Folder(joinPath(getEpisodeFolder(showName, episodeName).fsName, folderName));
    }

    function ensureFolder(folder) {
        if (folder.exists) {
            return true;
        }
        var parent = folder.parent;
        if (parent && !parent.exists && !ensureFolder(parent)) return false;
        return folder.create();
    }

    function getAepRootFolder(showName, episodeName) {
        return diskTarget("aepFolderName", showName, episodeName);
    }

    function buildShotFolderName(showName, episodeName, cardName) {
        return buildShotName(showName, episodeName, cardName, "t01").replace(/_t01$/i, "");
    }

    function getAepFolder(showName, episodeName, cardName) {
        var root = getAepRootFolder(showName, episodeName);
        if (settingEnabled(config.createIndependentProject) && cardName) {
            return new Folder(joinPath(root.fsName, buildShotFolderName(showName, episodeName, cardName)));
        }
        return root;
    }

    function getConfiguredRenderFolder(showName, episodeName) {
        var path = trimText(config.target_renderFolderName || "");
        if (!path) return null;
        var folder = path.indexOf("episode:") === 0 ? new Folder(joinPath(getEpisodeFolder(showName, episodeName).fsName, path.substring(8))) : new Folder(path);
        return folder.exists ? folder : null;
    }

    function getLatestAepFile(showName, episodeName, cardName) {
        var aepFolder = getAepFolder(showName, episodeName, cardName);
        if (!aepFolder.exists) {
            return null;
        }

        var templateParts = parseTemplateName();
        var episodeDigits = getEpisodeDigits(episodeName);
        var prefix = sanitizeFileName(showName) + "_" +
            templateParts.season + "E" + episodeDigits + "_" +
            sanitizeFileName(cardName) + "_";
        var files = aepFolder.getFiles("*.aep");
        var latestFile = null;
        var latestVersion = -1;

        for (var i = 0; i < files.length; i++) {
            if (!(files[i] instanceof File)) {
                continue;
            }
            var name = files[i].displayName || files[i].name;
            var lowerName = name.toLowerCase();
            var lowerPrefix = prefix.toLowerCase();
            if (lowerName.indexOf(lowerPrefix) !== 0) continue;
            var match = name.match(/_t(\d+)\.aep$/i);
            if (!match) continue;
            var versionNumber = parseInt(match[1], 10);
            if (versionNumber > latestVersion) {
                latestVersion = versionNumber;
                latestFile = files[i];
            }
        }

        return latestFile;
    }

    function validateInputs(showDropdown, episodeDropdown, cardEdit) {
        var showName = getSelectedText(showDropdown);
        var episodeName = getSelectedText(episodeDropdown);
        var cardName = trimText(cardEdit.text);

        if (isPlaceholder(showName) || showName === "") {
            alert(T("请先选择剧名。"));
            return null;
        }
        if (isPlaceholder(episodeName) || episodeName === "") {
            alert(T("请先选择集数。"));
            return null;
        }
        if (cardName === "") {
            alert(T("请先输入卡号。"));
            return null;
        }
        if (trimText(config.presetRootPath) === "") {
            alert(T("请先在设置里填写预设根目录。"));
            return null;
        }
        if (trimText(config.templateAepPath) === "") {
            alert(T("请先在设置里填写模板 AEP 路径。"));
            return null;
        }

        saveLastInputs(showName, episodeName, cardName);

        return {
            showName: showName,
            episodeName: episodeName,
            cardName: cardName
        };
    }

    function isSameFilePath(fileA, fileB) {
        if (!fileA || !fileB) {
            return false;
        }
        return normalizeSlashes(fileA.fsName).toLowerCase() === normalizeSlashes(fileB.fsName).toLowerCase();
    }

    function resetSingleCompletedRenderQueueItem() {
        var renderQueue = app.project.renderQueue;
        if (!renderQueue || renderQueue.numItems !== 1) {
            return;
        }

        var completedItem = renderQueue.item(1);
        if (!completedItem || completedItem.status !== RQItemStatus.DONE) {
            return;
        }

        var outputPaths = [];
        for (var i = 1; i <= completedItem.numOutputModules; i++) {
            var outputFile = completedItem.outputModule(i).file;
            outputPaths.push(outputFile ? outputFile.fsName : "");
        }

        var queuedItem = completedItem.duplicate();
        if (!queuedItem) {
            throw new Error(T("无法复制已完成的渲染队列任务。"));
        }

        for (var j = 1; j <= queuedItem.numOutputModules && j <= outputPaths.length; j++) {
            if (outputPaths[j - 1] !== "") {
                queuedItem.outputModule(j).file = new File(outputPaths[j - 1]);
            }
        }
        queuedItem.render = true;
        completedItem.remove();
    }

    function saveCurrentProjectBeforeOpen(targetFile) {
        var currentFile = app.project.file;
        if (!currentFile) {
            return true;
        }

        resetSingleCompletedRenderQueueItem();
        updateOutputCompAndRenderQueue(currentFile);
        app.project.save(currentFile);
        return true;
    }

    // Clear all memory and disk caches (equivalent to "Edit > Purge > All Memory & Disk Cache")
    function purgeAllCaches() {
        try {
            if (typeof PurgeTarget !== "undefined") {
                app.purge(PurgeTarget.ALL_CACHES);
            }
        } catch (purgeError) {
            // Purging failure should not affect the rest of the flow
        }
    }

    function openAepFile(aepFile) {
        if (!aepFile || !aepFile.exists) {
            alert(T("没有找到可打开的 AEP 文件。"));
            return false;
        }
        if (!saveCurrentProjectBeforeOpen(aepFile)) {
            return false;
        }
        app.open(aepFile);
        return true;
    }

    function handleOpen(showDropdown, episodeDropdown, cardEdit, takeEdit) {
        var inputs = validateInputs(showDropdown, episodeDropdown, cardEdit);
        if (!inputs) {
            return;
        }

        var latestFile = getLatestAepFile(inputs.showName, inputs.episodeName, inputs.cardName);
        if (!latestFile) {
            alert(T("没有找到对应工程。") + "\n\n" + getAepFolder(inputs.showName, inputs.episodeName, inputs.cardName).fsName);
            return;
        }
        if (openAepFile(latestFile)) {
            updateOutputCompAndRenderQueue(latestFile);
            app.project.save(latestFile);
            purgeAllCaches();
            if (takeEdit) {
                takeEdit.text = extractTakeFromAepFile(latestFile);
                saveLastInputs(inputs.showName, inputs.episodeName, inputs.cardName, takeEdit.text);
            }
        }
    }

    function showExistingAepDialog(latestFile) {
        var win = new Window("dialog", T("工程已存在"));
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.margins = 12;

        win.add("statictext", undefined, T("工程已存在，是否直接打开最新版本？"));
        win.add("statictext", undefined, decodeURI(latestFile.name));

        var buttons = win.add("group");
        buttons.orientation = "row";
        buttons.alignment = ["right", "center"];
        var openButton = buttons.add("button", undefined, T("打开"));
        var cancelButton = buttons.add("button", undefined, T("取消"));

        var result = false;
        openButton.onClick = function () {
            result = true;
            win.close();
        };
        cancelButton.onClick = function () {
            result = false;
            win.close();
        };

        win.center();
        win.show();
        return result;
    }

    function copyTemplateAep(showName, episodeName, cardName) {
        var templateFile = new File(config.templateAepPath);
        if (!templateFile.exists) {
            throw new Error(T("模板 AEP 不存在:\n") + templateFile.fsName);
        }

        var aepFolder = getAepFolder(showName, episodeName, cardName);
        if (!ensureFolder(aepFolder)) {
            throw new Error(T("无法创建 AEP 文件夹:\n") + aepFolder.fsName);
        }

        var shotName = buildShotName(showName, episodeName, cardName, "t01");
        var targetFile = new File(joinPath(aepFolder.fsName, shotName + ".aep"));
        if (targetFile.exists) {
            return targetFile;
        }

        if (!templateFile.copy(targetFile.fsName)) {
            throw new Error(T("复制模板 AEP 失败:\n") + targetFile.fsName);
        }

        return targetFile;
    }

    function getCellProjectFolder() {
        var folder = resolveProjectTarget("cellFolderName", false);
        if (!folder) throw Error(T("请在高级设置选择 Cell 放置文件夹。"));
        return folder;
    }

    function getLoProjectFolder() {
        var folder = resolveProjectTarget("loProjectFolderName", false);
        if (!folder) throw Error(T("请在高级设置选择 LO 放置文件夹。"));
        return folder;
    }

    function getBgProjectFolder() {
        var folder = resolveProjectTarget("bgProjectFolderName", false);
        if (!folder) throw Error(T("请在高级设置选择 BG 放置文件夹。"));
        return folder;
    }

    function getSampleProjectFolder() {
        var folder = resolveProjectTarget("sampleFolderName", false);
        if (!folder) throw Error(T("请在高级设置选择 Sample 放置文件夹。"));
        return folder;
    }

    function getFileBaseName(file) {
        var name = file.displayName || file.name;
        return name.replace(/\.[^\.]+$/i, "");
    }

    function getOutputCompBaseName(aepFile) {
        var parsedFields = parseShotNameFields(aepFile);
        if (!parsedFields) return getFileBaseName(aepFile);
        return buildOutputName({
            show: parsedFields.showName,
            episode: parsedFields.seasonEpisode,
            card: parsedFields.cardName,
            version: parsedFields.takeName
        }, config, false);
    }

    function findRootProjectFolder(folderName) {
        var project = app.project;
        for (var i = 1; i <= project.numItems; i++) {
            var item = project.item(i);
            if (item instanceof FolderItem && item.name === folderName && item.parentFolder === project.rootFolder) {
                return item;
            }
        }
        return null;
    }

    function findFirstCompInFolder(folderItem) {
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.parentFolder === folderItem) {
                return item;
            }
        }
        return null;
    }

    function findCompInFolder(folderItem, compName) {
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === compName && item.parentFolder === folderItem) {
                return item;
            }
        }
        return null;
    }

    function getFileExtension(file) {
        if (!file) {
            return "";
        }
        var match = file.name.match(/(\.[^\.]+)$/);
        return match ? match[1] : "";
    }

    function getShowEpisodeForAepFile(aepFile) {
        var fallback = { showName: config.lastShowName, episodeName: config.lastEpisodeName };
        if (!aepFile || !aepFile.parent || !config.presetRootPath) return fallback;
        var rootPath = normalizeSlashes(new Folder(config.presetRootPath).fsName).replace(/\/$/, "").toLowerCase();
        var cursor = aepFile.parent;
        var names = [];
        var guard = 0;
        while (cursor && guard++ < 64) {
            var cursorPath = normalizeSlashes(cursor.fsName).replace(/\/$/, "");
            if (cursorPath.toLowerCase() === rootPath) {
                if (names.length >= 2) return { showName: names[0], episodeName: names[1] };
                break;
            }
            names.unshift(decodeURI(cursor.name));
            cursor = cursor.parent;
        }
        return fallback;
    }

    function refreshRenderQueueOutputLocations(renderFolder, firstOutputBaseName) {
        var renderQueue = app.project.renderQueue;
        if (!renderQueue || renderQueue.numItems < 1) return false;
        var changed = false;
        for (var itemIndex = 1; itemIndex <= renderQueue.numItems; itemIndex++) {
            var renderItem = renderQueue.item(itemIndex);
            for (var moduleIndex = 1; moduleIndex <= renderItem.numOutputModules; moduleIndex++) {
                var outputModule;
                try {
                    outputModule = renderItem.outputModule(moduleIndex);
                } catch (outputModuleError) {
                    continue;
                }
                var currentFile = outputModule.file;
                var fileName = currentFile ? currentFile.name : sanitizeFileName(renderItem.comp ? renderItem.comp.name : "output");
                if (itemIndex === 1 && moduleIndex === 1 && firstOutputBaseName) {
                    fileName = sanitizeFileName(firstOutputBaseName) + getFileExtension(currentFile);
                }
                outputModule.file = new File(joinPath(renderFolder.fsName, fileName));
                changed = true;
            }
        }
        return changed;
    }

    function updateOutputCompAndRenderQueue(aepFile) {
        var result = {
            compRenamed: false,
            renderOutputRenamed: false
        };
        var firstOutputBaseName = "";
        var outputFolder = resolveProjectTarget("outputFolderName", false);
        if (outputFolder) {
            var firstComp = findFirstCompInFolder(outputFolder);
            if (firstComp) {
                firstComp.name = getOutputCompBaseName(aepFile);
                firstOutputBaseName = firstComp.name;
                result.compRenamed = true;
            }
        }
        var location = getShowEpisodeForAepFile(aepFile);
        if (location.showName && location.episodeName) {
            var renderFolder = getConfiguredRenderFolder(location.showName, location.episodeName);
            if (renderFolder) result.renderOutputRenamed = refreshRenderQueueOutputLocations(renderFolder, firstOutputBaseName);
        }
        return result;
    }

    function pushUniqueItem(items, item) {
        if (!item) {
            return;
        }
        for (var i = 0; i < items.length; i++) {
            if (items[i] === item) {
                return;
            }
        }
        items.push(item);
    }

    function sortItemsByNameAscending(items) {
        items.sort(function (a, b) {
            var aName = a.name.toLowerCase();
            var bName = b.name.toLowerCase();
            if (aName < bName) {
                return -1;
            }
            if (aName > bName) {
                return 1;
            }
            return 0;
        });
    }

    function resizeCompToItem(targetComp, sourceItem) {
        if (!sourceItem || !sourceItem.width || !sourceItem.height) {
            return false;
        }

        targetComp.width = sourceItem.width;
        targetComp.height = sourceItem.height;
        return true;
    }

    function deselectAllCompLayers(compItem) {
        for (var i = 1; i <= compItem.numLayers; i++) {
            compItem.layer(i).selected = false;
        }
    }

    function selectLayers(layers) {
        for (var i = 0; i < layers.length; i++) {
            layers[i].selected = true;
        }
    }

    function deselectAllProjectItems() {
        var selectedItems;

        try {
            selectedItems = app.project.selection;
        } catch (selectionError) {
            selectedItems = null;
        }

        if (!selectedItems) {
            return;
        }

        for (var i = 0; i < selectedItems.length; i++) {
            selectedItems[i].selected = false;
        }
    }

    function addImportedItemsToMainComp(cellItems, loItems, psdComps, warnings) {
        var targetComp = null;
        try { targetComp = resolveProjectTarget("targetCompName", true); }
        catch (targetError) { appendImportWarning(warnings, targetError.message || String(targetError)); return false; }
        if (!targetComp) { appendImportWarning(warnings, T("找不到目标合成，请在高级设置选择目标合成。")); return false; }

        var sortedCells = cellItems.slice(0);
        var sortedLos = loItems.slice(0);
        var sortedPsds = psdComps.slice(0);
        var importedCellLayers = [];
        sortItemsByNameAscending(sortedCells);
        sortItemsByNameAscending(sortedLos);
        sortItemsByNameAscending(sortedPsds);

        app.beginUndoGroup(T("将导入素材放入合成"));
        try {
            deselectAllCompLayers(targetComp);
            if (sortedCells.length > 0) {
                resizeCompToItem(targetComp, sortedCells[0]);
            }
            for (var i = 0; i < sortedPsds.length; i++) {
                targetComp.layers.add(sortedPsds[i]);
            }
            for (var j = 0; j < sortedCells.length; j++) {
                importedCellLayers.push(targetComp.layers.add(sortedCells[j]));
            }
            for (var k = 0; k < sortedLos.length; k++) {
                var loLayer = targetComp.layers.add(sortedLos[k]);
                loLayer.opacity.setValue(50);
            }
            selectLayers(importedCellLayers);
        } finally {
            app.endUndoGroup();
        }

        return true;
    }

    function isFileWithExtension(file, extensions) {
        if (!(file instanceof File)) {
            return false;
        }
        var name = file.name;
        var match = name.match(/\.([^\.]+)$/);
        if (!match) {
            return false;
        }
        return arrayContainsLower(extensions, match[1]);
    }

    function collectFilesRecursive(folder, extensions, excludedNames, nameContains, result) {
        result = result || [];
        if (!folder.exists) {
            return result;
        }

        var items = folder.getFiles();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item instanceof Folder) {
                var folderName = decodeURI(item.name);
                if (arrayHasKeywordInText(excludedNames, folderName)) {
                    continue;
                }
                collectFilesRecursive(item, extensions, excludedNames, nameContains, result);
            } else if (isFileWithExtension(item, extensions)) {
                if (!nameContains || decodeURI(item.name).toLowerCase().indexOf(String(nameContains).toLowerCase()) !== -1) {
                    result.push(item);
                }
            }
        }
        return result;
    }

    function collectFilesByNameTokens(folder, excludedNames, requiredTokens, result) {
        result = result || [];
        if (!folder || !folder.exists) return result;
        var items = folder.getFiles();
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item instanceof Folder) {
                var folderName = decodeURI(item.name);
                if (!arrayHasKeywordInText(excludedNames, folderName)) collectFilesByNameTokens(item, excludedNames, requiredTokens, result);
            } else if (item instanceof File) {
                var lowerName = decodeURI(item.name).toLowerCase();
                var matches = true;
                for (var j = 0; j < requiredTokens.length; j++) {
                    if (lowerName.indexOf(String(requiredTokens[j]).toLowerCase()) === -1) { matches = false; break; }
                }
                if (matches) result.push(item);
            }
        }
        return result;
    }

    function makeSequenceGroups(files) {
        var map = {};
        var groups = [];

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var fileName = decodeURI(file.name);
            var match = fileName.match(/^(.*?)(\d+)(\.[^\.]+)$/);
            var key;
            var frameNumber = -1;

            if (match) {
                key = file.parent.fsName + "|" + match[1].toLowerCase() + "|" + match[3].toLowerCase();
                frameNumber = parseInt(match[2], 10);
            } else {
                key = file.fsName.toLowerCase();
            }

            if (!map[key]) {
                map[key] = {
                    firstFile: file,
                    firstFrame: frameNumber
                };
                groups.push(map[key]);
            }

            if (frameNumber >= 0 && (map[key].firstFrame < 0 || frameNumber < map[key].firstFrame)) {
                map[key].firstFile = file;
                map[key].firstFrame = frameNumber;
            } else if (frameNumber < 0 && fileName < decodeURI(map[key].firstFile.name)) {
                map[key].firstFile = file;
            }
        }

        return groups;
    }

    function importSequenceGroup(group, targetFolder) {
        var options = new ImportOptions(group.firstFile);
        options.sequence = true;
        try {
            options.forceAlphabetical = false;
        } catch (ignoreForceAlphabetical) {
        }
        var importedItem = app.project.importFile(options);
        // Interpret TP sequences at 24 fps independently of AE import preferences.
        if (importedItem.mainSource && !importedItem.mainSource.isStill) {
            importedItem.mainSource.conformFrameRate = 24;
        }
        importedItem.parentFolder = targetFolder;
        return importedItem;
    }

    function findTpCandidateFolders(showName, episodeName, cardName, rootOverride) {
        var tpRoot = rootOverride || diskTarget("tpFolderName", showName, episodeName);
        var result = [];
        if (!tpRoot.exists) {
            return result;
        }

        var folders = getFolders(tpRoot);
        var cardLower = String(cardName).toLowerCase();
        for (var i = 0; i < folders.length; i++) {
            if (decodeURI(folders[i].name).toLowerCase().indexOf(cardLower) !== -1) {
                result.push(folders[i]);
            }
        }
        return result;
    }

    function chooseFolderDialog(folders) {
        if (folders.length === 0) {
            return null;
        }
        if (folders.length === 1) {
            return folders[0];
        }

        var win = new Window("dialog", T("选择 TP 文件夹"));
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.margins = 12;
        win.add("statictext", undefined, T("找到多个匹配文件夹，请选择一个："));

        var items = [];
        for (var i = 0; i < folders.length; i++) {
            items.push(decodeURI(folders[i].name));
        }
        var list = win.add("listbox", undefined, items);
        list.preferredSize = [360, 180];
        list.selection = 0;

        var buttons = win.add("group");
        buttons.orientation = "row";
        buttons.alignment = ["right", "center"];
        var okButton = buttons.add("button", undefined, T("确定"));
        var cancelButton = buttons.add("button", undefined, T("取消"));

        var selectedFolder = null;
        okButton.onClick = function () {
            if (list.selection) {
                selectedFolder = folders[list.selection.index];
            }
            win.close();
        };
        cancelButton.onClick = function () {
            selectedFolder = null;
            win.close();
        };

        win.center();
        win.show();
        return selectedFolder;
    }

    function importCellSequences(showName, episodeName, cardName, rootOverride, candidatesOverride, warnings) {
        var result = {
            count: 0,
            items: []
        };
        var candidates = candidatesOverride || findTpCandidateFolders(showName, episodeName, cardName, rootOverride);
        if (candidates.length === 0) {
            appendImportWarning(warnings, T("没有找到匹配卡号的 TP 文件夹。"));
            return result;
        }

        var selectedFolder = chooseFolderDialog(candidates);
        if (!selectedFolder) {
            return result;
        }

        var extensions = splitCsv(config.sequenceExtensions);
        var excludedNames = splitCsv(config.excludedFolderNames);
        var files = collectFilesRecursive(selectedFolder, extensions, excludedNames, null);
        if (files.length === 0) {
            appendImportWarning(warnings, T("没有找到可导入的图片序列。"));
            return result;
        }

        var targetFolder = null;
        try { targetFolder = getCellProjectFolder(); }
        catch (cellTargetError) { appendImportWarning(warnings, cellTargetError.message || String(cellTargetError)); return result; }
        var groups = makeSequenceGroups(files);

        for (var i = 0; i < groups.length; i++) {
            var importedItem = importSequenceGroup(groups[i], targetFolder);
            result.items.push(importedItem);
            result.count++;
        }
        return result;
    }

    function snapshotRootProjectFolderIds() {
        var ids = {};
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof FolderItem && item.parentFolder === app.project.rootFolder) ids["$" + item.id] = true;
        }
        return ids;
    }

    function findNewRootProjectFolders(previousIds) {
        var folders = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof FolderItem && item.parentFolder === app.project.rootFolder && !previousIds["$" + item.id]) folders.push(item);
        }
        return folders;
    }

    function removeRenderQueueItemsAddedAfter(previousCount) {
        var queue = app.project.renderQueue;
        for (var i = queue.numItems; i > previousCount; i--) queue.item(i).remove();
    }

    function importPsdFile(file, targetFolder) {
        var options = new ImportOptions(file);

        if (options.canImportAs && options.canImportAs(ImportAsType.COMP_CROPPED_LAYERS)) {
            options.importAs = ImportAsType.COMP_CROPPED_LAYERS;
        }

        var rootFolderIdsBeforeImport = snapshotRootProjectFolderIds();
        var importedItem = app.project.importFile(options);
        var layerFolders = findNewRootProjectFolders(rootFolderIdsBeforeImport);

        if (importedItem) {
            importedItem.parentFolder = targetFolder;
            for (var i = 0; i < layerFolders.length; i++) layerFolders[i].parentFolder = targetFolder;
        }

        return {
            importedItem: importedItem,
            layerFolder: layerFolders.length ? layerFolders[0] : null
        };
    }

    function importBgPsds(showName, episodeName, cardName, rootOverride, filesOverride, warnings) {
        var result = {
            count: 0,
            comps: []
        };
        var bgRoot = rootOverride || diskTarget("bgFolderName", showName, episodeName);
        if (!filesOverride && !bgRoot.exists) {
            appendImportWarning(warnings, T("没有找到 BG 文件夹:") + "\n" + bgRoot.fsName);
            return result;
        }

        var excludedNames = splitCsv(config.excludedFolderNames);
        var psdFiles = filesOverride || collectFilesRecursive(bgRoot, ["psd"], excludedNames, cardName);
        if (psdFiles.length === 0) {
            appendImportWarning(warnings, T("没有找到匹配卡号的 PSD 文件。"));
            return result;
        }

        var targetFolder = null;
        try { targetFolder = getBgProjectFolder(); }
        catch (bgTargetError) { appendImportWarning(warnings, bgTargetError.message || String(bgTargetError)); return result; }
        for (var i = 0; i < psdFiles.length; i++) {
            var importResult = importPsdFile(psdFiles[i], targetFolder);
            result.count++;
            if (importResult.importedItem instanceof CompItem) {
                pushUniqueItem(result.comps, importResult.importedItem);
            }
        }
        return result;
    }

    function importLoFiles(showName, episodeName, cardName, rootOverride, warnings) {
        var result = { count: 0, items: [] };
        var configuredLoPath = trimText(config.target_loFolderName || "");
        var loRoot = rootOverride || (configuredLoPath ? diskTarget("loFolderName", showName, episodeName) : diskTarget("tpFolderName", showName, episodeName));
        var excludedNames = splitCsv(config.excludedFolderNames);
        var loFiles = collectFilesByNameTokens(loRoot, excludedNames, [cardName, "lo"]);
        if (loFiles.length === 0) {
            appendImportWarning(warnings, T("没有找到匹配卡号且名称含有 LO 的文件。"));
            return result;
        }
        var targetFolder = null;
        try { targetFolder = getLoProjectFolder(); }
        catch (loTargetError) { appendImportWarning(warnings, loTargetError.message || String(loTargetError)); return result; }
        for (var i = 0; i < loFiles.length; i++) {
            var importedItem = app.project.importFile(new ImportOptions(loFiles[i]));
            importedItem.parentFolder = targetFolder;
            result.items.push(importedItem);
            result.count++;
        }
        return result;
    }

    function importAssets(showName, episodeName, cardName, sourceRoots) {
        sourceRoots = sourceRoots || {};
        var warnings = [];
        var cellResult = {
            count: 0,
            items: []
        };
        var loResult = {
            count: 0,
            items: []
        };
        var psdResult = {
            count: 0,
            comps: []
        };

        app.beginUndoGroup(T("导入镜头素材"));
        try {
            cellResult = importCellSequences(showName, episodeName, cardName, sourceRoots.tpRoot, sourceRoots.tpCandidates, warnings);
            loResult = importLoFiles(showName, episodeName, cardName, sourceRoots.loRoot, warnings);
            psdResult = importBgPsds(showName, episodeName, cardName, sourceRoots.bgRoot, sourceRoots.bgFiles, warnings);
        } finally {
            app.endUndoGroup();
        }

        return {
            cellCount: cellResult.count,
            loCount: loResult.count,
            psdCount: psdResult.count,
            cellItems: cellResult.items,
            loItems: loResult.items,
            psdComps: psdResult.comps,
            warnings: warnings
        };
    }

    function relativeDiskPath(file, rootFolder) {
        var root = normalizeSlashes(rootFolder.fsName).replace(/\/$/, "");
        var full = normalizeSlashes(file.fsName);
        return full.toLowerCase().indexOf(root.toLowerCase() + "/") === 0 ? full.substring(root.length + 1) : decodeURI(file.name);
    }

    function transferFile(sourceFile, sourceRoot, targetRoot, removeSource) {
        var destination = new File(joinPath(targetRoot.fsName, relativeDiskPath(sourceFile, sourceRoot)));
        if (!ensureFolder(destination.parent)) throw Error(T("无法创建素材目录:\n") + destination.parent.fsName);
        if (!sourceFile.copy(destination.fsName)) throw Error(T("复制素材失败:\n") + sourceFile.fsName);
        if (removeSource && !sourceFile.remove()) throw Error(T("删除源素材失败:\n") + sourceFile.fsName);
        return destination;
    }

    function copyFolderTree(sourceFolder, destinationFolder) {
        if (!ensureFolder(destinationFolder)) throw Error(T("无法创建素材目录:\n") + destinationFolder.fsName);
        var items = sourceFolder.getFiles();
        for (var i = 0; i < items.length; i++) {
            if (items[i] instanceof Folder) {
                copyFolderTree(items[i], new Folder(joinPath(destinationFolder.fsName, decodeURI(items[i].name))));
            } else if (!items[i].copy(joinPath(destinationFolder.fsName, decodeURI(items[i].name)))) {
                throw Error(T("复制素材失败:\n") + items[i].fsName);
            }
        }
    }

    function removeFolderTree(folder) {
        var items = folder.getFiles();
        for (var i = 0; i < items.length; i++) {
            if (items[i] instanceof Folder) removeFolderTree(items[i]);
            else if (!items[i].remove()) throw Error(T("删除源素材失败:\n") + items[i].fsName);
        }
        if (!folder.remove()) throw Error(T("删除源素材失败:\n") + folder.fsName);
    }

    function transferTpFolder(sourceFolder, targetRoot, removeSource) {
        var destination = new Folder(joinPath(targetRoot.fsName, decodeURI(sourceFolder.name)));
        copyFolderTree(sourceFolder, destination);
        if (removeSource) removeFolderTree(sourceFolder);
        return destination;
    }

    function prepareIndependentProjectAssets(showName, episodeName, cardName) {
        var roots = {};
        if (!settingEnabled(config.createIndependentProject)) return roots;
        var shotFolder = getAepFolder(showName, episodeName, cardName);
        if (shotFolder.exists) return roots;
        if (!ensureFolder(shotFolder)) throw Error(T("无法创建 AEP 文件夹:\n") + shotFolder.fsName);

        var moveTp = settingEnabled(config.cutTpFiles);
        var copyTp = settingEnabled(config.copyTpFiles);
        if (moveTp || copyTp) {
            var tpCandidates = findTpCandidateFolders(showName, episodeName, cardName);
            var selectedTp = chooseFolderDialog(tpCandidates);
            var transferredTp = selectedTp ? transferTpFolder(selectedTp, shotFolder, moveTp) : null;
            roots.tpCandidates = transferredTp ? [transferredTp] : [];
            if (!trimText(config.target_loFolderName || "")) roots.loRoot = transferredTp || shotFolder;
        }

        var moveBg = settingEnabled(config.cutBgFiles);
        var copyBg = settingEnabled(config.copyBgFiles);
        if (moveBg || copyBg) {
            var bgRoot = diskTarget("bgFolderName", showName, episodeName);
            var bgFiles = collectFilesRecursive(bgRoot, ["psd"], splitCsv(config.excludedFolderNames), cardName);
            var transferredBgFiles = [];
            for (var i = 0; i < bgFiles.length; i++) transferredBgFiles.push(transferFile(bgFiles[i], bgRoot, shotFolder, false));
            if (moveBg) for (var j = 0; j < bgFiles.length; j++) {
                if (!bgFiles[j].remove()) throw Error(T("删除源素材失败:\n") + bgFiles[j].fsName);
            }
            roots.bgRoot = shotFolder;
            roots.bgFiles = transferredBgFiles;
        }
        return roots;
    }

    function createNewAepAndImportAssets(inputs, saveAfterCreate) {
        var sourceRoots = prepareIndependentProjectAssets(inputs.showName, inputs.episodeName, inputs.cardName);
        var newAepFile = copyTemplateAep(inputs.showName, inputs.episodeName, inputs.cardName);
        if (!openAepFile(newAepFile)) {
            return false;
        }
        updateOutputCompAndRenderQueue(newAepFile);
        var result = importAssets(inputs.showName, inputs.episodeName, inputs.cardName, sourceRoots);
        addImportedItemsToMainComp(result.cellItems, result.loItems, result.psdComps, result.warnings);
        showImportWarnings(result.warnings);
        if (saveAfterCreate !== false) app.project.save(newAepFile);
        purgeAllCaches();
        deselectAllProjectItems();
        return true;
    }

    function importReferenceAep(showDropdown, episodeDropdown, cardEdit) {
        var inputs = validateInputs(showDropdown, episodeDropdown, cardEdit);
        if (!inputs) return null;
        try {
            var aepFile = getLatestAepFile(inputs.showName, inputs.episodeName, inputs.cardName);
            if (!aepFile) throw Error(T("没有找到对应工程。") + "\n\n" + getAepFolder(inputs.showName, inputs.episodeName, inputs.cardName).fsName);
            var targetFolder = getSampleProjectFolder();
            var rootFolderIdsBeforeImport = snapshotRootProjectFolderIds();
            var renderQueueCountBeforeImport = app.project.renderQueue.numItems;
            app.beginUndoGroup(T("导入参考工程"));
            try {
                var importedItem = app.project.importFile(new ImportOptions(aepFile));
                var importedRootFolders = findNewRootProjectFolders(rootFolderIdsBeforeImport);
                if (importedItem) importedItem.parentFolder = targetFolder;
                for (var i = 0; i < importedRootFolders.length; i++) importedRootFolders[i].parentFolder = targetFolder;
            } finally {
                removeRenderQueueItemsAddedAfter(renderQueueCountBeforeImport);
                app.endUndoGroup();
            }
            return (aepFile.displayName || aepFile.name) + T(" 已导入参考文件夹");
        } catch (error) {
            alert(error.message || String(error));
            return null;
        }
    }

    function openExistingAepAndApply(aepFile) {
        if (openAepFile(aepFile)) {
            updateOutputCompAndRenderQueue(aepFile);
            app.project.save(aepFile);
            purgeAllCaches();
            return true;
        }
        return false;
    }

    function showContinueSaveAsDialog(title, lines) {
        var win = new Window("dialog", title);
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.margins = 12;

        for (var i = 0; i < lines.length; i++) {
            win.add("statictext", undefined, lines[i]);
        }

        var buttons = win.add("group");
        buttons.orientation = "row";
        buttons.alignment = ["right", "center"];
        var continueButton = buttons.add("button", undefined, T("继续另存为"));
        var cancelButton = buttons.add("button", undefined, T("取消"));

        var result = false;
        continueButton.onClick = function () {
            result = true;
            win.close();
        };
        cancelButton.onClick = function () {
            result = false;
            win.close();
        };

        win.center();
        win.show();
        return result;
    }

    function handleSaveVersion(showDropdown, episodeDropdown, cardEdit, takeEdit) {
        var inputs = validateInputs(showDropdown, episodeDropdown, cardEdit);
        if (!inputs) return false;

        var takeName = trimText(takeEdit.text);
        if (takeName === "") {
            alert(T("请先输入版本。"));
            return false;
        }
        if (!app.project.file) {
            alert(T("当前工程还没有 AEP 文件路径。"));
            return false;
        }

        try {
            saveLastInputs(inputs.showName, inputs.episodeName, inputs.cardName, takeName);

            var currentFile = app.project.file;
            var currentFields = parseShotNameFields(currentFile);
            var targetFields = buildShotFields(inputs.showName, inputs.episodeName, inputs.cardName, takeName);
            var targetFolder = getAepFolder(inputs.showName, inputs.episodeName, inputs.cardName);
            var targetFile = new File(joinPath(targetFolder.fsName, targetFields.baseName + ".aep"));
            var mismatches = collectFieldMismatches(currentFields, targetFields);

            if (!ensureFolder(targetFolder)) {
                throw new Error(T("无法创建 AEP 文件夹:\n") + targetFolder.fsName);
            }

            if (isSameFilePath(currentFile, targetFile)) {
                updateOutputCompAndRenderQueue(currentFile);
                app.project.save(currentFile);
                return true;
            }

            if (mismatches.length > 0) {
                var lines = [
                    T("当前 AEP 和输入信息不一致:"),
                    ""
                ];
                for (var i = 0; i < mismatches.length; i++) {
                    lines.push(mismatches[i]);
                }
                lines.push("");
                lines.push(T("目标: ") + targetFields.baseName + ".aep");
                if (!showContinueSaveAsDialog(T("信息不一致"), lines)) return false;
            }

            if (targetFile.exists) {
                if (!showContinueSaveAsDialog(T("目标已存在"), [
                    T("目标 AEP 已存在:"),
                    decodeURI(targetFile.name),
                    "",
                    T("是否继续另存为？")
                ])) return false;
            }

            updateOutputCompAndRenderQueue(targetFile);
            app.project.save(targetFile);
            return true;
        } catch (error) {
            alert(error.message);
            return false;
        }
    }

    function handleNew(showDropdown, episodeDropdown, cardEdit, takeEdit) {
        var inputs = validateInputs(showDropdown, episodeDropdown, cardEdit);
        if (!inputs) {
            return;
        }

        try {
            var latestFile = getLatestAepFile(inputs.showName, inputs.episodeName, inputs.cardName);
            if (latestFile) {
                if (showExistingAepDialog(latestFile)) {
                    openExistingAepAndApply(latestFile);
                    if (takeEdit) {
                        takeEdit.text = extractTakeFromAepFile(latestFile);
                        saveLastInputs(inputs.showName, inputs.episodeName, inputs.cardName, takeEdit.text);
                    }
                }
                return;
            }

            if (createNewAepAndImportAssets(inputs, true) && takeEdit) {
                takeEdit.text = "t01";
                saveLastInputs(inputs.showName, inputs.episodeName, inputs.cardName, takeEdit.text);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    function handleEnterOpenOrNew(showDropdown, episodeDropdown, cardEdit, takeEdit) {
        var inputs = validateInputs(showDropdown, episodeDropdown, cardEdit);
        if (!inputs) {
            return;
        }

        try {
            var latestFile = getLatestAepFile(inputs.showName, inputs.episodeName, inputs.cardName);
            if (latestFile) {
                openExistingAepAndApply(latestFile);
                if (takeEdit) {
                    takeEdit.text = extractTakeFromAepFile(latestFile);
                    saveLastInputs(inputs.showName, inputs.episodeName, inputs.cardName, takeEdit.text);
                }
            } else {
                // Enter-created projects save the current project before opening,
                // but leave the newly imported project changes unsaved.
                if (createNewAepAndImportAssets(inputs, false) && takeEdit) {
                    takeEdit.text = "t01";
                    saveLastInputs(inputs.showName, inputs.episodeName, inputs.cardName, takeEdit.text);
                }
            }
        } catch (error) {
            alert(error.message);
        }
    }

    function addLabeledEdit(parent, label, text, width) {
        var group = parent.add("group");
        group.orientation = "row";
        group.alignChildren = ["left", "center"];
        group.add("statictext", undefined, label);
        var edit = group.add("edittext", undefined, text);
        edit.characters = width || 32;
        return edit;
    }

    function addPathEdit(parent, label, text, browseType) {
        var group = parent.add("group");
        group.orientation = "row";
        group.alignChildren = ["left", "center"];
        group.add("statictext", undefined, label);
        var edit = group.add("edittext", undefined, text);
        edit.characters = 42;
        var browse = group.add("button", undefined, T("浏览"));
        browse.onClick = function () {
            if (browseType === "folder") {
                var selectedFolder = Folder.selectDialog(T("选择") + label);
                if (selectedFolder) {
                    edit.text = selectedFolder.fsName;
                }
            } else {
                var selectedFile = File.openDialog(T("选择") + label, "*.aep");
                if (selectedFile) {
                    edit.text = selectedFile.fsName;
                }
            }
        };
        return edit;
    }

    var TARGET_SPECS = [
        { key: "tpFolderName", label: "TP 文件夹", kind: "disk", tip: "用于导入动画素材。" },
        { key: "loFolderName", label: "LO 文件夹", kind: "disk", optional: true, virtualDefault: "— 在TP中查找 —", tip: "用于导入 LO 素材；留空时从 TP 文件夹查找。" },
        { key: "bgFolderName", label: "BG 文件夹", kind: "disk", tip: "用于导入美术背景素材。" },
        { key: "aepFolderName", label: "AEP 文件夹", kind: "disk", tip: "用于保存 AE 工程 AEP 的文件夹。" },
        { key: "renderFolderName", label: "Render 文件夹", kind: "disk", tip: "用于保存渲染输出文件。" },
        { key: "loProjectFolderName", label: "LO 放置文件夹", kind: "folder", tip: "用于放置导入后的 LO 素材的项目文件夹。" },
        { key: "cellFolderName", label: "Cell 放置文件夹", kind: "folder", tip: "用于放置导入后的动画序列的项目文件夹。" },
        { key: "bgProjectFolderName", label: "BG 放置文件夹", kind: "folder", tip: "用于放置导入后的美术背景素材的项目文件夹。" },
        { key: "sampleFolderName", label: "Sample 放置文件夹", kind: "folder", tip: "用于放置导入的参考 AEP。" },
        { key: "outputFolderName", label: "Output 放置文件夹", kind: "folder", tip: "用于指示最终输出合成所在的项目文件夹。" },
        { key: "targetCompName", label: "目标合成", kind: "comp", tip: "用于指定所有素材导入后放入时间线的合成。" }
    ];

    function encodeItemPath(parts) {
        var encoded = [];
        for (var i = 0; i < parts.length; i++) encoded.push(encodeURIComponent(parts[i]));
        return encoded.join("/");
    }
    function decodeItemPath(path) {
        if (!path) return [];
        var parts = String(path).split("/");
        for (var i = 0; i < parts.length; i++) parts[i] = decodeURIComponent(parts[i]);
        return parts;
    }

    function projectChildren(parent, includeComps) {
        var children = [];
        if (!parent || !app.project) return children;
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item.parentFolder === parent && (item instanceof FolderItem || (includeComps && item instanceof CompItem))) children.push(item);
        }
        children.sort(function (a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : a.id - b.id); });
        return children;
    }
    function resolveProjectTarget(key, wantComp) {
        if (!app.project) throw Error(T("请先打开 AE 工程。"));
        var explicitPath = config["target_" + key];
        if (!explicitPath) return null;
        var parts = decodeItemPath(explicitPath);
        var parent = app.project.rootFolder;
        for (var i = 0; i < parts.length; i++) {
            var wantCompHere = wantComp && i === parts.length - 1;
            var children = projectChildren(parent, wantCompHere), matches = [];
            for (var j = 0; j < children.length; j++) {
                if (children[j].name === parts[i] && (wantCompHere ? children[j] instanceof CompItem : children[j] instanceof FolderItem)) matches.push(children[j]);
            }
            if (matches.length > 1) throw Error(T("目标路径存在同名项目，请先重命名后重新选择：") + parts.join(" / "));
            if (matches.length === 0) throw Error(T("找不到设置目标，请在高级设置重新选择：") + parts.join(" / "));
            parent = matches[0];
        }
        return parent;
    }

    function diskTarget(key, showName, episodeName) {
        var path = config["target_" + key];
        // Episode-relative selections follow the main panel's show/episode selection.
        if (path && path.indexOf("episode:") === 0) return new Folder(joinPath(getEpisodeFolder(showName, episodeName).fsName, path.substring(8)));
        return path ? new Folder(path) : new Folder(joinPath(getEpisodeFolder(showName, episodeName).fsName, config[key]));
    }
    function showSettingWindow(onSaved) {
        var win = new Window("dialog", T("设置"), undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.margins = 14;
        win.spacing = 10;
        var tabs = win.add("tabbedpanel");
        tabs.alignChildren = ["fill", "fill"];
        tabs.preferredSize = [580, 540];
        var basic = tabs.add("tab", undefined, T("基础设置"));
        basic.orientation = "column";
        basic.alignChildren = ["fill", "top"];
        basic.margins = 16;
        basic.spacing = 12;
        var rootEdit = addPathEdit(basic, T("预设根目录"), config.presetRootPath, "folder");
        var templateEdit = addPathEdit(basic, T("模板 AEP"), config.templateAepPath, "file");
        var namingOrder = getOutputNameOrder();
        var namingPatterns = {
            show: config.outputNameShowPattern || "",
            episode: config.outputNameEpisodePattern || "",
            card: config.outputNameCardPattern || "",
            version: config.outputNameVersionPattern || ""
        };
        var namingLabels = { show: "剧名", episode: "集数", card: "卡号", version: "版本" };
        var namingButtons = [];
        var namingEdits = [];
        var namingTip = T("空白→保留原值\n文字→替换原值\n+→插入原值\n++→输入普通加号\n例：集数输入“AA+BB”→“AA集数BB”");
        var outputNameSeparatorEdit = null;
        var outputNamePreview = null;

        function saveVisibleNamingPatterns() {
            for (var i = 0; i < namingEdits.length; i++) namingPatterns[namingOrder[i]] = namingEdits[i].text;
        }
        function namingDraftSettings() {
            return {
                outputNameOrder: namingOrder.join(","),
                outputNameShowPattern: namingPatterns.show,
                outputNameEpisodePattern: namingPatterns.episode,
                outputNameCardPattern: namingPatterns.card,
                outputNameVersionPattern: namingPatterns.version,
                outputNameSeparator: outputNameSeparatorEdit ? outputNameSeparatorEdit.text : config.outputNameSeparator
            };
        }
        function refreshOutputNamePreview() {
            saveVisibleNamingPatterns();
            try {
                var sampleShow = config.lastShowName || "Sample";
                var sampleEpisode = config.lastEpisodeName || "01";
                var sampleCard = config.lastCardName || "001";
                var sampleVersion = config.lastTakeName || "t01";
                var sampleParts = buildRawShotComponents(sampleShow, sampleEpisode, sampleCard, sampleVersion);
                outputNamePreview.text = T("预览") + ": " + buildOutputName(sampleParts, namingDraftSettings(), false);
            } catch (previewError) {
                outputNamePreview.text = T("预览") + ": " + (previewError.message || String(previewError));
            }
        }
        function refreshNamingSlots() {
            for (var i = 0; i < namingOrder.length; i++) {
                namingButtons[i].text = T(namingLabels[namingOrder[i]]);
                namingEdits[i].text = namingPatterns[namingOrder[i]] || "";
            }
            refreshOutputNamePreview();
        }
        var selectedNameSlot = -1;
        function bindNamingSlot(index) {
            namingButtons[index].onClick = function () {
                saveVisibleNamingPatterns();
                if (selectedNameSlot < 0) {
                    selectedNameSlot = index;
                    namingButtons[index].active = true;
                    return;
                }
                if (selectedNameSlot !== index) {
                    var selectedKey = namingOrder[selectedNameSlot];
                    namingOrder[selectedNameSlot] = namingOrder[index];
                    namingOrder[index] = selectedKey;
                }
                selectedNameSlot = -1;
                refreshNamingSlots();
            };
            namingEdits[index].onChanging = refreshOutputNamePreview;
        }
        function buildOutputNameSettings(parent) {
            var outputNamePanel = parent.add("panel", undefined, T("输出名称设置"));
            outputNamePanel.orientation = "column";
            outputNamePanel.alignChildren = ["fill", "top"];
            outputNamePanel.margins = [10, 14, 10, 8];
            outputNamePanel.spacing = 5;
            outputNamePanel.helpTip = namingTip;
            var outputNameBlocks = outputNamePanel.add("group");
            outputNameBlocks.orientation = "row";
            outputNameBlocks.alignChildren = ["fill", "top"];
            outputNameBlocks.spacing = 6;
            for (var nameSlotIndex = 0; nameSlotIndex < 4; nameSlotIndex++) {
                var nameSlot = outputNameBlocks.add("group");
                nameSlot.orientation = "column";
                nameSlot.alignChildren = ["fill", "top"];
                nameSlot.spacing = 2;
                nameSlot.alignment = ["fill", "top"];
                var nameButton = nameSlot.add("button", undefined, "");
                nameButton.preferredSize.height = 22;
                nameButton.helpTip = T("点击两个按钮可互换位置。") + "\n" + namingTip;
                var nameEdit = nameSlot.add("edittext", undefined, "");
                nameEdit.characters = 11;
                nameEdit.helpTip = namingTip;
                namingButtons.push(nameButton);
                namingEdits.push(nameEdit);
            }
            var separatorRow = outputNamePanel.add("group");
            separatorRow.orientation = "row";
            separatorRow.alignChildren = ["left", "center"];
            separatorRow.add("statictext", undefined, T("块间隔符"));
            outputNameSeparatorEdit = separatorRow.add("edittext", undefined, config.outputNameSeparator === undefined ? "_" : config.outputNameSeparator);
            outputNameSeparatorEdit.characters = 8;
            outputNamePreview = outputNamePanel.add("statictext", undefined, "", { truncate: "middle" });
            outputNamePreview.alignment = ["fill", "top"];
            outputNamePreview.helpTip = namingTip;
            for (var bindSlotIndex = 0; bindSlotIndex < 4; bindSlotIndex++) bindNamingSlot(bindSlotIndex);
            outputNameSeparatorEdit.onChanging = refreshOutputNamePreview;
            refreshNamingSlots();
        }
        var renderLocationRow = basic.add("group");
        renderLocationRow.orientation = "row";
        renderLocationRow.alignChildren = ["left", "center"];
        var localRenderCheck = renderLocationRow.add("checkbox", undefined, T("本机渲染"));
        localRenderCheck.value = config.localRender !== "false";
        var remoteRenderLabel = renderLocationRow.add("statictext", undefined, T("他机aerender地址"));
        var remoteRenderEdit = renderLocationRow.add("edittext", undefined, config.remoteAerenderPath || "");
        remoteRenderEdit.characters = 28;
        var remoteRenderBrowse = renderLocationRow.add("button", undefined, T("浏览"));
        function refreshRemoteRenderControls() {
            var enabled = !localRenderCheck.value;
            remoteRenderLabel.enabled = enabled;
            remoteRenderEdit.enabled = enabled;
            remoteRenderBrowse.enabled = enabled;
        }
        localRenderCheck.onClick = refreshRemoteRenderControls;
        remoteRenderBrowse.onClick = function () {
            var selectedFolder = Folder.selectDialog(T("选择") + T("他机aerender地址"));
            if (selectedFolder) remoteRenderEdit.text = selectedFolder.fsName;
        };
        refreshRemoteRenderControls();
        var languageRow = basic.add("group");
        languageRow.orientation = "row";
        languageRow.alignChildren = ["left", "center"];
        languageRow.add("statictext", undefined, T("语言"));
        var languageSelect = languageRow.add("dropdownlist", undefined, []);
        for (var languageIndex = 0; languageIndex < LANGUAGE_OPTIONS.length; languageIndex++) {
            languageSelect.add("item", LANGUAGE_LABELS[LANGUAGE_OPTIONS[languageIndex]]);
        }
        var savedLanguageIndex = languageIndexOf(config.language || "zh");
        if (savedLanguageIndex < 0 || savedLanguageIndex >= LANGUAGE_OPTIONS.length) savedLanguageIndex = 0;
        languageSelect.selection = savedLanguageIndex;
        var currentLanguageIndex = savedLanguageIndex;
        var languageChangeHandling = false;
        function selectedLanguageIndex() {
            var index = languageSelect.selection ? languageSelect.selection.index : currentLanguageIndex;
            return index >= 0 && index < LANGUAGE_OPTIONS.length ? index : currentLanguageIndex;
        }
        languageSelect.onChange = function () {
            if (languageChangeHandling) return;
            if (!languageSelect.selection) {
                languageChangeHandling = true;
                languageSelect.selection = currentLanguageIndex;
                languageChangeHandling = false;
                return;
            }
            currentLanguageIndex = selectedLanguageIndex();
        };
        var advanced = tabs.add("tab", undefined, T("高级设置"));
        advanced.orientation = "row";
        advanced.alignChildren = ["fill", "fill"];
        advanced.margins = [1, 10, 1, 10];
        advanced.spacing = 2;
        var instructions = tabs.add("tab", undefined, T("说明"));
        instructions.orientation = "column";
        instructions.alignChildren = ["fill", "top"];
        instructions.margins = 16;
        // Keep attribution at the bottom of the Instructions tab in all languages.
        var instructionsSpacer = instructions.add("group");
        instructionsSpacer.alignment = ["fill", "fill"];
        var licenseFooter = instructions.add("group");
        licenseFooter.orientation = "column";
        licenseFooter.alignment = ["fill", "bottom"];
        licenseFooter.alignChildren = ["center", "top"];
        licenseFooter.spacing = 3;
        addProjectQr(licenseFooter);
        licenseFooter.add("statictext", undefined, SCRIPT_NAME + " v" + SCRIPT_VERSION);
        licenseFooter.add("statictext", undefined, T("作者：yuzhou-2023@foxmail.com（Copyright (C) 2026）"));
        licenseFooter.add("statictext", undefined, T("使用和修改请遵守协议：GPL-3.0-only"));
        licenseFooter.add("statictext", undefined, "https://www.gnu.org/licenses/gpl-3.0.html");
        var viewport = advanced.add("panel", undefined, "", { borderStyle: "none" });
        viewport.alignment = ["fill", "fill"];
        viewport.preferredSize = [550, 460];
        viewport.margins = 0;
        var body = viewport.add("group");
        body.orientation = "column";
        body.alignChildren = ["fill", "top"];
        body.spacing = 10;
        body.margins = 4;
        var scroll = advanced.add("scrollbar", undefined, 0, 0, 100);
        scroll.preferredSize.width = 16;
        scroll.minimumSize.width = 16;
        scroll.maximumSize.width = 16;
        scroll.stepdelta = 28;
        var naturalHeight = 0;
        function fitAdvancedEdges() {
            // Anchor the native scrollbar explicitly; fill alignment can leave extra space.
            var width = advanced.size.width;
            var height = advanced.size.height;
            if (width < 20 || height < 24) return;
            var right = width - 1;
            scroll.bounds = [right - 16, 10, right, height - 10];
            viewport.bounds = [1, 10, Math.max(2, right - 18), height - 10];
        }
        function positionBody() {
            var w = Math.max(360, viewport.size.width - 4);
            body.bounds = [0, -scroll.value, w, naturalHeight - scroll.value];
        }
        function relayout() {
            body.layout.layout(true);
            naturalHeight = 8;
            for (var childIndex = 0; childIndex < body.children.length; childIndex++) {
                naturalHeight += body.children[childIndex].size.height;
                if (childIndex > 0) naturalHeight += body.spacing;
            }
            win.layout.layout(true);
            win.layout.resize();
            fitAdvancedEdges();
            scroll.maxvalue = Math.max(0, naturalHeight - viewport.size.height);
            scroll.value = Math.min(scroll.value, scroll.maxvalue);
            scroll.enabled = scroll.maxvalue > 0;
            positionBody();
        }
        // This viewport deliberately clips the scrolling content rather than sizing to it.
        viewport.layout = { layout: function () {}, resize: function () { positionBody(); } };
        scroll.onChanging = scroll.onChange = positionBody;
        var advancedInitialized = false;
        var episodeRoot = null, editors = [], extensions = null, exclusions = null;
        var independentProjectCheck = null, cutTpCheck = null, copyTpCheck = null, cutBgCheck = null, copyBgCheck = null;
        var diskChildrenCache = {}, projectChildrenCache = null;
        function cachedChildren(parent, kind) {
            if (!parent) return [];
            if (kind === "disk") {
                var diskKey = "$" + normalizeSlashes(parent.fsName).toLowerCase();
                if (!diskChildrenCache.hasOwnProperty(diskKey)) diskChildrenCache[diskKey] = getFolders(parent);
                return diskChildrenCache[diskKey];
            }
            if (projectChildrenCache === null) {
                projectChildrenCache = {};
                if (app.project) {
                    var count = app.project.numItems;
                    for (var itemIndex = 1; itemIndex <= count; itemIndex++) {
                        var item = app.project.item(itemIndex);
                        if (!(item instanceof FolderItem) && !(item instanceof CompItem)) continue;
                        var key = "$" + item.parentFolder.id;
                        if (!projectChildrenCache.hasOwnProperty(key)) projectChildrenCache[key] = [];
                        projectChildrenCache[key].push(item);
                    }
                    for (var bucket in projectChildrenCache) if (projectChildrenCache.hasOwnProperty(bucket)) {
                        projectChildrenCache[bucket].sort(function (a, b) { return a.name < b.name ? -1 : (a.name > b.name ? 1 : a.id - b.id); });
                    }
                }
            }
            var candidates = projectChildrenCache["$" + parent.id] || [], result = [];
            for (var i = 0; i < candidates.length; i++) if (kind === "comp" || candidates[i] instanceof FolderItem) result.push(candidates[i]);
            return result;
        }
        function initializeAdvanced() {
            if (advancedInitialized) return;
            episodeRoot = config.presetRootPath && config.lastShowName && config.lastEpisodeName ? getEpisodeFolder(config.lastShowName, config.lastEpisodeName) : null;
        var newSettingsPanel = body.add("panel", undefined, T("新建设置"));
        newSettingsPanel.orientation = "column";
        newSettingsPanel.alignChildren = ["left", "top"];
        newSettingsPanel.spacing = 8;
        newSettingsPanel.margins = [4, 16, 4, 8];
        independentProjectCheck = newSettingsPanel.add("checkbox", undefined, T("同时创建新独立工程文件到AEP文件夹"));
        independentProjectCheck.value = settingEnabled(config.createIndependentProject);
        var transferOptions = newSettingsPanel.add("group");
        transferOptions.orientation = "column";
        transferOptions.alignChildren = ["left", "top"];
        transferOptions.spacing = 6;
        var tpTransferRow = transferOptions.add("group");
        tpTransferRow.orientation = "row";
        tpTransferRow.alignChildren = ["left", "center"];
        tpTransferRow.spacing = 12;
        cutTpCheck = tpTransferRow.add("checkbox", undefined, T("剪切TP文件"));
        copyTpCheck = tpTransferRow.add("checkbox", undefined, T("复制TP文件"));
        cutTpCheck.preferredSize = [120, 22];
        copyTpCheck.preferredSize = [120, 22];
        cutTpCheck.value = settingEnabled(config.cutTpFiles);
        copyTpCheck.value = !cutTpCheck.value && settingEnabled(config.copyTpFiles);
        var bgTransferRow = transferOptions.add("group");
        bgTransferRow.orientation = "row";
        bgTransferRow.alignChildren = ["left", "center"];
        bgTransferRow.spacing = 12;
        cutBgCheck = bgTransferRow.add("checkbox", undefined, T("剪切BG文件"));
        copyBgCheck = bgTransferRow.add("checkbox", undefined, T("复制BG文件"));
        cutBgCheck.preferredSize = [120, 22];
        copyBgCheck.preferredSize = [120, 22];
        cutBgCheck.value = settingEnabled(config.cutBgFiles);
        copyBgCheck.value = !cutBgCheck.value && settingEnabled(config.copyBgFiles);
        function refreshTransferOptions() { transferOptions.enabled = independentProjectCheck.value; }
        independentProjectCheck.onClick = refreshTransferOptions;
        cutTpCheck.onClick = function () { if (cutTpCheck.value) copyTpCheck.value = false; };
        copyTpCheck.onClick = function () { if (copyTpCheck.value) cutTpCheck.value = false; };
        cutBgCheck.onClick = function () { if (cutBgCheck.value) copyBgCheck.value = false; };
        copyBgCheck.onClick = function () { if (copyBgCheck.value) cutBgCheck.value = false; };
        refreshTransferOptions();
        var diskSettingsPanel = body.add("panel", undefined, T("磁盘目录设置"));
        diskSettingsPanel.orientation = "column";
        diskSettingsPanel.alignChildren = ["fill", "top"];
        diskSettingsPanel.spacing = 8;
        diskSettingsPanel.margins = [4, 16, 4, 6];
        var diskScopeNote = diskSettingsPanel.add("statictext", undefined, T("磁盘目录以当前剧名·集数对应目录为根目录。"));
        diskScopeNote.helpTip = episodeRoot ? episodeRoot.fsName : "";
        var projectSettingsPanel = body.add("panel", undefined, T("AE 项目设置"));
        projectSettingsPanel.orientation = "column";
        projectSettingsPanel.alignChildren = ["fill", "top"];
        projectSettingsPanel.spacing = 8;
        projectSettingsPanel.margins = [4, 16, 4, 6];
        projectSettingsPanel.add("statictext", undefined, T("AE 目录从当前项目根目录开始；＋进入所选目录的下一层。"));
        function makeTargetEditor(spec) {
            var editorParent = spec.kind === "disk" ? diskSettingsPanel : projectSettingsPanel;
            var row = editorParent.add("group");
            row.orientation = "row";
            row.alignChildren = ["left", "top"];
            row.spacing = 6;
            var label = row.add("statictext", undefined, T(spec.label));
            label.helpTip = T(spec.tip);
            label.preferredSize.width = 112;
            var chain = row.add("group");
            chain.orientation = "column";
            chain.alignChildren = ["fill", "top"];
            chain.spacing = 4;
            chain.preferredSize.width = 350;
            var levelButtons = row.add("group");
            levelButtons.orientation = "row";
            levelButtons.alignment = ["left", "bottom"];
            levelButtons.spacing = 4;
            levelButtons.margins = 0;
            var plus = levelButtons.add("button", undefined, "+");
            plus.preferredSize = [24, 24];
            plus.helpTip = T("添加下一层目录选择");
            var minus = levelButtons.add("button", undefined, "−");
            minus.preferredSize = [24, 24];
            minus.helpTip = T("删除最下一级，使用上一级作为目标");
            minus.visible = false;
            var rebuilding = false;
            var levels = [];
            var stored = config["target_" + spec.key] || "";
            var changed = false;
            var virtualChoice = spec.virtualDefault ? { virtualDefault: true, name: spec.virtualDefault } : null;
            function selectedAt(index) {
                var d = levels[index];
                if (!d || !d.selection || d.selection.index <= 0) return null;
                if (d._virtualChoice && d.selection.index === 1) return d._virtualChoice;
                return d._choices[d.selection.index - 1 - d._choiceOffset];
            }
            function current() { return selectedAt(levels.length - 1); }
            function children(parent) {
                return cachedChildren(parent, spec.kind);
            }
            function refreshPlus() {
                if (rebuilding) return;
                minus.visible = levels.length > 1;
                var target = current();
                plus.enabled = !!target && !target.virtualDefault && (spec.kind === "disk" || target instanceof FolderItem) && children(target).length > 0;
            }
            function addLevel(parent, wanted) {
                var items = children(parent);
                var dropdown = chain.add("dropdownlist", undefined, [T("— 选择目标 —")]);
                dropdown.preferredSize = [350, 24];
                dropdown._choices = items;
                dropdown._parent = parent;
                var hasVirtualChoice = !!virtualChoice && levels.length === 0;
                dropdown._virtualChoice = hasVirtualChoice ? virtualChoice : null;
                dropdown._choiceOffset = hasVirtualChoice ? 1 : 0;
                if (hasVirtualChoice) dropdown.add("item", T(spec.virtualDefault));
                var matches = 0, matchIndex = -1;
                for (var i = 0; i < items.length; i++) {
                    var name = spec.kind === "disk" ? decodeURI(items[i].name) : items[i].name;
                    dropdown.add("item", name + (items[i] instanceof CompItem ? T("  [合成]") : ""));
                    if (wanted === name) { matches++; matchIndex = i + 1 + dropdown._choiceOffset; }
                }
                dropdown.selection = matches === 1 ? matchIndex : (hasVirtualChoice && !wanted ? 1 : 0);
                levels.push(dropdown);
                dropdown.onChange = function () {
                    changed = true;
                    var index = 0;
                    while (levels[index] !== dropdown) index++;
                    while (levels.length > index + 1) chain.remove(levels.pop());
                    refreshPlus();
                    relayout();
                };
                refreshPlus();
                return selectedAt(levels.length - 1);
            }
            function rebuild() {
                rebuilding = true;
                while (levels.length) chain.remove(levels.pop());
                var parent = spec.kind === "disk" ? episodeRoot : (app.project ? app.project.rootFolder : null);
                var parts = [];
                if (spec.kind === "disk") {
                    var targetPath = stored;
                    if (targetPath.indexOf("episode:") === 0 && episodeRoot) targetPath = episodeRoot.fsName + "/" + targetPath.substring(8);
                    if (!targetPath && episodeRoot && spec.key !== "renderFolderName" && !spec.optional) targetPath = joinPath(episodeRoot.fsName, config[spec.key]);
                    var rootPath = episodeRoot ? normalizeSlashes(episodeRoot.fsName).replace(/\/$/, "") : "";
                    targetPath = normalizeSlashes(targetPath);
                    if (rootPath && targetPath.toLowerCase().indexOf(rootPath.toLowerCase() + "/") === 0) parts = targetPath.substring(rootPath.length + 1).split("/");
                } else parts = decodeItemPath(stored);
                if (!parts.length) addLevel(parent, null);
                else for (var i = 0; i < parts.length; i++) {
                    parent = addLevel(parent, parts[i]);
                    if (!parent || (spec.kind !== "disk" && !(parent instanceof FolderItem))) break;
                }
                if (stored && (!current() || (parts.length && levels.length < parts.length))) {
                    chain.helpTip = T("已保存的目标当前不在浏览目录中；未修改时会保留原设置。");
                }
                rebuilding = false;
                refreshPlus();
            }
            plus.onClick = function () { var target = current(); if (target) { changed = true; addLevel(target, null); relayout(); } };
            minus.onClick = function () {
                if (levels.length <= 1) return;
                changed = true;
                chain.remove(levels.pop());
                refreshPlus();
                relayout();
            };
            function value() {
                if (!changed) return stored;
                var selected = current();
                if (!selected) {
                    if (spec.optional) return "";
                    if (changed) throw Error(T("请选择完整的“") + T(spec.label) + T("”目标。"));
                    return stored;
                }
                if (selected.virtualDefault) return "";
                if (spec.kind === "comp" && !(selected instanceof CompItem)) throw Error(T("“目标合成”请选择合成；可点击＋继续进入下级目录。"));
                if (spec.kind === "disk") {
                    var path = normalizeSlashes(selected.fsName);
                    if (config.presetRootPath && config.lastShowName && config.lastEpisodeName) {
                        var ep = episodeRoot ? normalizeSlashes(episodeRoot.fsName).replace(/\/$/, "") : "";
                        if (path.toLowerCase().indexOf(ep.toLowerCase() + "/") === 0) return "episode:" + path.substring(ep.length + 1);
                    }
                    return selected.fsName;
                }
                var names = [];
                for (var j = 0; j < levels.length; j++) {
                    var item = selectedAt(j), siblings = levels[j]._choices, duplicates = 0;
                    for (var k = 0; k < siblings.length; k++) if (siblings[k].name === item.name && (siblings[k] instanceof CompItem) === (item instanceof CompItem)) duplicates++;
                    if (duplicates > 1) throw Error(T("同级存在同名目标：") + item.name + T("。请先重命名后再选择。"));
                    names.push(item.name);
                }
                return encodeItemPath(names);
            }
            rebuild();
            var editor = { spec: spec, value: value, rebuild: rebuild };
            editors.push(editor);
        }
        for (var t = 0; t < TARGET_SPECS.length; t++) makeTargetEditor(TARGET_SPECS[t]);
        buildOutputNameSettings(projectSettingsPanel);

        function makeValueMenu(parent, labelText, key, defaults, tipText) {
            var row = parent.add("group");
            var label = row.add("statictext", undefined, T(labelText));
            label.helpTip = T(tipText);
            label.preferredSize.width = 112;
            var dropdown = row.add("dropdownlist", undefined, []);
            dropdown.preferredSize = [350, 24];
            var active = splitCsv(config[key]), values = splitCsv(defaults), custom = splitCsv(config["options_" + key] || "");
            var i;
            for (i = 0; i < custom.length; i++) if (!arrayContainsLower(values, custom[i])) values.push(custom[i]);
            for (i = 0; i < active.length; i++) if (!arrayContainsLower(values, active[i])) values.push(active[i]);
            function refresh() {
                dropdown.removeAll();
                dropdown.add("item", T("已启用：") + (active.length ? active.join(", ") : T("无")));
                for (var j = 0; j < values.length; j++) dropdown.add("item", (arrayContainsLower(active, values[j]) ? "✓ " : "   ") + values[j]);
                dropdown.add("item", T("+ 添加自定义…"));
                dropdown.selection = 0;
            }
            dropdown.onChange = function () {
                if (!dropdown.selection || dropdown.selection.index === 0) return;
                var index = dropdown.selection.index;
                if (index === values.length + 1) {
                    var dialog = new Window("dialog", T("添加") + T(labelText));
                    dialog.orientation = "column";
                    dialog.alignChildren = ["fill", "top"];
                    dialog.add("statictext", undefined, T("输入一个项目："));
                    var edit = dialog.add("edittext", undefined, ""); edit.characters = 28;
                    var actions = dialog.add("group");
                    var add = actions.add("button", undefined, T("添加"), { name: "ok" });
                    actions.add("button", undefined, T("取消"), { name: "cancel" });
                    add.onClick = function () {
                        var value = trimText(edit.text);
                        if (key === "sequenceExtensions") value = value.replace(/^\./, "").toLowerCase();
                        if (!value || /[,\\\/\r\n]/.test(value) || (key === "sequenceExtensions" && !/^[a-z0-9]+$/.test(value))) { alert(T("请输入一个有效项目，不要包含逗号或路径分隔符。")); return; }
                        if (!arrayContainsLower(values, value)) values.push(value);
                        if (!arrayContainsLower(active, value)) active.push(value);
                        dialog.close(1);
                    };
                    dialog.show();
                } else {
                    var picked = values[index - 1], next = [], found = false;
                    for (var j = 0; j < active.length; j++) { if (active[j].toLowerCase() === picked.toLowerCase()) found = true; else next.push(active[j]); }
                    if (!found) next.push(picked);
                    active = next;
                }
                refresh();
            };
            refresh();
            return { active: function () { return active.join(","); }, options: function () { return values.join(","); } };
        }
        extensions = makeValueMenu(diskSettingsPanel, "序列后缀", "sequenceExtensions", "png,tga", "导入动画序列时可接受的文件后缀名。");
        exclusions = makeValueMenu(diskSettingsPanel, "排除文件夹", "excludedFolderNames", "old,go", "避免误导入素材的排除文件夹关键词。");
            advancedInitialized = true;
        }
        var actions = win.add("group");
        actions.alignment = ["right", "bottom"];
        var save = actions.add("button", undefined, T("保存"));
        var cancel = actions.add("button", undefined, T("取消"), { name: "cancel" });
        save.onClick = function () {
            try {
                var pending = {};
                for (var i = 0; i < editors.length; i++) pending["target_" + editors[i].spec.key] = editors[i].value();
                pending.presetRootPath = trimText(rootEdit.text);
                pending.templateAepPath = trimText(templateEdit.text);
                pending.localRender = localRenderCheck.value ? "true" : "false";
                pending.remoteAerenderPath = trimText(remoteRenderEdit.text);
                pending.language = LANGUAGE_OPTIONS[selectedLanguageIndex()];
                saveVisibleNamingPatterns();
                pending.outputNameOrder = namingOrder.join(",");
                pending.outputNameShowPattern = namingPatterns.show;
                pending.outputNameEpisodePattern = namingPatterns.episode;
                pending.outputNameCardPattern = namingPatterns.card;
                pending.outputNameVersionPattern = namingPatterns.version;
                pending.outputNameSeparator = outputNameSeparatorEdit ? outputNameSeparatorEdit.text : config.outputNameSeparator;
                if (advancedInitialized) {
                    pending.createIndependentProject = independentProjectCheck.value ? "true" : "false";
                    pending.cutTpFiles = cutTpCheck.value ? "true" : "false";
                    pending.copyTpFiles = copyTpCheck.value ? "true" : "false";
                    pending.cutBgFiles = cutBgCheck.value ? "true" : "false";
                    pending.copyBgFiles = copyBgCheck.value ? "true" : "false";
                    pending.sequenceExtensions = extensions.active();
                    pending.excludedFolderNames = exclusions.active();
                    pending.options_sequenceExtensions = extensions.options();
                    pending.options_excludedFolderNames = exclusions.options();
                }
                for (var key in pending) if (pending.hasOwnProperty(key)) config[key] = pending[key];
                saveConfig();
                win.close(1);
                if (onSaved) onSaved();
            } catch (error) { alert(error.message || String(error)); }
        };
        cancel.onClick = function () { win.close(0); };
        tabs.selection = basic;
        tabs.onChange = function () {
            if (tabs.selection === advanced) initializeAdvanced();
            relayout();
        };
        win.onResizing = win.onResize = function () { this.layout.resize(); fitAdvancedEdges(); scroll.maxvalue = Math.max(0, naturalHeight - viewport.size.height); scroll.value = Math.min(scroll.value, scroll.maxvalue); positionBody(); };
        relayout();
        win.center();
        win.show();
    }

    function enqueueCurrentProject() {
    function quote(s) { return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\x00-\x1f]/g, function(c) { return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4); }) + '"'; }
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function expiry() { var d = new Date(new Date().getTime() + 30000); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth()+1) + "-" + pad(d.getUTCDate()) + "T" + pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds()) + "Z"; }
    function bridgeBase() {
        if (config.localRender !== "false") return $.getenv("LOCALAPPDATA") + "/AepBatchRenderer/bridge/";
        var configured = trimText(config.remoteAerenderPath || "");
        if (!configured) throw Error(T("他机 AErender 地址未设置。"));
        var directRequests = new Folder(joinPath(configured, "requests"));
        if (directRequests.exists) return new Folder(configured).fsName + "/";
        var nestedBridge = new Folder(joinPath(configured, "bridge"));
        var nestedRequests = new Folder(joinPath(nestedBridge.fsName, "requests"));
        if (nestedRequests.exists) return nestedBridge.fsName + "/";
        throw Error(T("找不到他机 AErender 请求目录：") + configured);
    }
    function call(action, fields) {
        var base = bridgeBase();
        if (!Folder(base + "requests").exists) throw Error(T("请打开AErender"));
        var id = ""; for (var i=0; i<32; i++) id += Math.floor(Math.random()*16).toString(16);
        var req = File(base + "requests/" + id + ".tmp"); req.encoding = "UTF-8";
        if (!req.open("w")) throw Error(T("无法写入请求；请检查 AE 脚本文件访问权限。"));
        req.write('{"action":' + quote(action) + ',"expiresUtc":' + quote(expiry()) + (fields || "") + '}'); req.close();
        if (!req.rename(id + ".json")) throw Error(T("无法提交请求。"));
        var publishedRequest = File(base + "requests/" + id + ".json");
        var result = File(base + "results/" + id + ".json"), deadline = new Date().getTime() + 1200;
        while (!result.exists && new Date().getTime() < deadline) $.sleep(100);
        if (!result.exists) {
            // Script-side cancellation: remove the request if AErender has not claimed it yet.
            try { if (publishedRequest.exists) publishedRequest.remove(); } catch (removeRequestError) {}
            throw Error(T("请打开AErender\n等待响应超时，请先检查队列，避免重复提交。"));
        }
        result.encoding = "UTF-8"; if (!result.open("r")) throw Error(T("无法读取响应。"));
        var text = result.read(); result.close();
        // Do not eval external JSON in ExtendScript. Return raw JSON to the caller.
        if (!/"ok"\s*:\s*true/.test(text)) throw Error(text);
        return text;
    }
    try {
        if (!app.project) throw Error(T("没有可保存的 AE 工程。"));
        // Saving finishes before publishing the request; new projects use AE's save dialog.
        app.project.save();
        if (!app.project.file || app.project.dirty) throw Error(T("工程未保存成功或已取消保存，未发送到 AErender。"));
        updateOutputCompAndRenderQueue(app.project.file);
        app.project.save(app.project.file);
        if (app.project.dirty) throw Error(T("工程未保存成功或已取消保存，未发送到 AErender。"));
        var response = call("enqueue", ',"paths":[' + quote(app.project.file.fsName) + ']');
        var addedMatch = /"added"\s*:\s*(\d+)/.exec(response);
        if (!addedMatch) throw Error(T("渲染器返回的入队结果无效。"));
        var taskName = app.project.file.displayName || app.project.file.name || app.project.file.fsName.replace(/^.*[\\\/]/, "");
        return { ok: true, message: taskName + (parseInt(addedMatch[1], 10) > 0 ? T(" 成功加入队列") : T(" 已在队列中")) };
    } catch(e) { return { ok: false, message: e.message || String(e) }; }
    }

    function buildShowEpisodePanel(parent, showWidth, episodeWidth) {
        var resolvedShowWidth = showWidth || 60;
        var resolvedEpisodeWidth = episodeWidth || 30;
        var panelWidth = resolvedShowWidth + resolvedEpisodeWidth + 18;
        var panel = parent.add("panel", undefined, T("剧名·集数"));
        panel.orientation = "row";
        panel.alignChildren = ["center", "center"];
        panel.spacing = 4;
        // Keep title clearance separate from visible padding around the dropdowns.
        panel.margins = [2, 10, 2, 0];
        panel.preferredSize.width = panelWidth;
        panel.minimumSize.width = panelWidth;
        panel.maximumSize.width = panelWidth;

        var content = panel.add("group");
        content.orientation = "row";
        content.alignChildren = ["left", "center"];
        content.alignment = ["left", "top"];
        content.spacing = 4;
        content.margins = [0, 8, 0, 5];

        var showControl = content.add("dropdownlist", undefined, []);
        showControl.preferredSize.width = resolvedShowWidth;
        showControl.minimumSize.width = resolvedShowWidth;
        showControl.maximumSize.width = resolvedShowWidth;
        showControl.alignment = ["left", "center"];

        var episodeControl = content.add("dropdownlist", undefined, []);
        episodeControl.preferredSize.width = resolvedEpisodeWidth;
        episodeControl.minimumSize.width = resolvedEpisodeWidth;
        episodeControl.maximumSize.width = resolvedEpisodeWidth;
        episodeControl.alignment = ["left", "center"];

        // Measure native controls first, then reserve their height plus actual padding.
        content.layout.layout(true);
        var controlHeight = Math.max(showControl.size.height, episodeControl.size.height);
        content.minimumSize.height = controlHeight + 8 + 5;
        panel.minimumSize.height = content.minimumSize.height + 10;

        return {
            panel: panel,
            showControl: showControl,
            episodeControl: episodeControl
        };
    }

    function changeTrailingNumber(edit, delta) {
        var text = edit.text;
        var match = text.match(/(\d+)$/);
        if (!match) {
            return;
        }

        var digits = match[1];
        var prefix = text.substring(0, text.length - digits.length);
        var width = digits.length;
        var value = parseInt(digits, 10) + delta;
        if (value < 0) {
            value = 0;
        }

        var valueText = String(value);
        while (valueText.length < width) {
            valueText = "0" + valueText;
        }
        edit.text = prefix + valueText;
    }

    function buildStepInputGroup(parent, groupWidth, characters) {
        var resolvedGroupWidth = groupWidth || 60;
        var group = parent.add("group");
        group.orientation = "column";
        group.alignChildren = ["fill", "center"];
        group.spacing = 2;
        group.preferredSize.width = resolvedGroupWidth;
        group.minimumSize.width = resolvedGroupWidth;
        group.maximumSize.width = resolvedGroupWidth;

        var upButton = group.add("button", undefined, "+", { name: "upButton" });
        upButton.preferredSize = [resolvedGroupWidth, 15];
        upButton.size = [resolvedGroupWidth, 15];
        upButton.alignment = ["center", "center"];

        var control = group.add("edittext", undefined, "");
        control.characters = characters || 8;
        control.preferredSize.width = resolvedGroupWidth;
        control.minimumSize.width = resolvedGroupWidth;
        control.maximumSize.width = resolvedGroupWidth;
        control.alignment = ["fill", "center"];

        var downButton = group.add("button", undefined, "-", { name: "downButton" });
        downButton.preferredSize = [resolvedGroupWidth, 15];
        downButton.size = [resolvedGroupWidth, 15];
        downButton.alignment = ["center", "center"];

        upButton.onClick = function () {
            changeTrailingNumber(control, 1);
        };
        downButton.onClick = function () {
            changeTrailingNumber(control, -1);
        };

        return {
            group: group,
            control: control,
            upButton: upButton,
            downButton: downButton
        };
    }

    function buildCardTakePanel(parent, cardWidth, cardCharacters, takeWidth, takeCharacters) {
        var resolvedCardWidth = cardWidth || 80;
        var resolvedTakeWidth = takeWidth || 60;
        var panelWidth = resolvedCardWidth + resolvedTakeWidth + 18;
        var panel = parent.add("panel", undefined, T("卡号·版本"));
        panel.orientation = "row";
        panel.alignChildren = ["center", "center"];
        panel.spacing = 4;
        panel.margins = [2, 10, 2, 6];
        panel.preferredSize.width = panelWidth;
        panel.minimumSize.width = panelWidth;
        panel.maximumSize.width = panelWidth;

        var cardInput = buildStepInputGroup(panel, resolvedCardWidth, cardCharacters);
        var takeInput = buildStepInputGroup(panel, resolvedTakeWidth, takeCharacters);

        return {
            panel: panel,
            cardInput: cardInput,
            takeInput: takeInput
        };
    }

    function BuildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", undefined, undefined, { resizeable: true });
        if (win instanceof Window) win.text = SCRIPT_NAME;
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 6;
        win.margins = 8;

        var settingsHitArea = win.add("statictext", [0, 0, 1, 1], "");
        settingsHitArea.visible = false;
        var inputs = win.add("group");
        inputs.orientation = "row";
        inputs.alignChildren = ["left", "fill"];
        inputs.spacing = 8;

        var showEpisodeColumn = inputs.add("group");
        showEpisodeColumn.orientation = "column";
        showEpisodeColumn.alignChildren = ["fill", "top"];
        showEpisodeColumn.alignment = ["left", "fill"];
        showEpisodeColumn.spacing = 2;
        showEpisodeColumn.margins = 0;
        var showEpisodeInput = buildShowEpisodePanel(showEpisodeColumn, 80, 50);
        showEpisodeInput.panel.alignment = ["fill", "top"];
        var renderSpacer = showEpisodeColumn.add("group");
        renderSpacer.alignment = ["fill", "fill"];
        renderSpacer.minimumSize.height = 0;
        renderSpacer.preferredSize.height = 0;
        var aerenderButton = showEpisodeColumn.add("button", undefined, T("AErender"));
        aerenderButton.preferredSize = [148, 18];
        aerenderButton.alignment = ["fill", "bottom"];
        aerenderButton.helpTip = T("将当前已保存的 AE 工程加入 AEP Render 队列；请先打开渲染器。");
        aerenderButton.onClick = function () {
            aerenderButton.enabled = false;
            try {
                renderStatus.text = "";
                if (!handleSaveVersion(showInput.control, episodeInput.control, cardInput.control, takeInput.control)) return;
                var enqueueResult = enqueueCurrentProject();
                renderStatus.text = enqueueResult.message.replace(/[\r\n]+/g, " ");
                renderStatus.helpTip = enqueueResult.message;
                if (!enqueueResult.ok) {
                    alert(enqueueResult.message);
                }
            }
            finally { aerenderButton.enabled = true; }
        };
        var showInput = {
            panel: showEpisodeInput.panel,
            control: showEpisodeInput.showControl
        };
        var episodeInput = {
            panel: showEpisodeInput.panel,
            control: showEpisodeInput.episodeControl
        };
        var cardTakeInput = buildCardTakePanel(inputs, 60, 8, 32, 6);
        var cardInput = cardTakeInput.cardInput;
        var takeInput = cardTakeInput.takeInput;
        var lastSaveShortcutAt = 0;
        cardInput.control.text = config.lastCardName;
        takeInput.control.text = config.lastTakeName || "t01";

        var buttons = inputs.add("group");
        buttons.orientation = "column";
        buttons.alignChildren = ["center", "center"];
        buttons.spacing = 6;
        buttons.alignment = ["left", "center"];

        var openButton = buttons.add("button", undefined, T("打开"));
        var newButton = buttons.add("button", undefined, T("新建"));
        var referenceButton = buttons.add("button", undefined, T("参考"));
        openButton.preferredSize = [60, 18];
        newButton.preferredSize = [60, 18];
        referenceButton.preferredSize = [60, 18];

        var renderStatus = win.add("statictext", undefined, T("可以右键单击脚本UI空白区域打开设置"), { truncate: "end" });
        renderStatus.alignment = ["fill", "bottom"];
        renderStatus.helpTip = T("可以右键单击脚本UI空白区域打开设置");
        // Status is positioned below the controls, outside their minimum footprint.
        renderStatus.preferredSize = [0, 0];
        renderStatus.minimumSize = [0, 0];

        function refreshShows() {
            var currentShow = getSelectedText(showInput.control);
            if (isPlaceholder(currentShow) || currentShow === "") {
                currentShow = config.lastShowName;
            }
            var rootFolder = new Folder(config.presetRootPath);
            var showNames = getFolderNames(rootFolder);
            resetDropdown(showInput.control, showNames, trimText(config.presetRootPath) === "" ? T("未设置") : T("未找到"));
            if (!selectDropdownItem(showInput.control, currentShow)) {
                saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
            }
            refreshEpisodes();
        }

        function refreshEpisodes() {
            var showName = getSelectedText(showInput.control);
            if (isPlaceholder(showName) || showName === "") {
                resetDropdown(episodeInput.control, [], T("未找到"));
                return;
            }
            var currentEpisode = getSelectedText(episodeInput.control);
            if (isPlaceholder(currentEpisode) || currentEpisode === "") {
                currentEpisode = config.lastEpisodeName;
            }
            var episodeNames = getFolderNames(getShowFolder(showName));
            resetDropdown(episodeInput.control, episodeNames, T("未找到"));
            if (!selectDropdownItem(episodeInput.control, currentEpisode)) {
                saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
            }
        }

        function runSaveShortcut() {
            var now = (new Date()).getTime();
            if (now - lastSaveShortcutAt < 300) {
                return;
            }
            lastSaveShortcutAt = now;
            handleSaveVersion(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        }

        function refreshInputsFromCurrentAep() {
            // Validate every field before touching the controls or their saved values.
            var fields = readCurrentAepInputs();
            if (!fields) return;
            resetDropdown(showInput.control, fields.showNames, T("未找到"));
            selectDropdownItem(showInput.control, fields.showName);
            resetDropdown(episodeInput.control, fields.episodeNames, T("未找到"));
            selectDropdownItem(episodeInput.control, fields.episodeName);
            cardInput.control.text = fields.cardName;
            takeInput.control.text = fields.takeName;
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        }

        function bindEnterOpenOrNew(control) {
            if (!control || !control.addEventListener) {
                return;
            }
            control.addEventListener("keydown", function (event) {
                if (event.ctrlKey && String(event.keyName).toLowerCase() === "s") {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    runSaveShortcut();
                } else if (String(event.keyName).toUpperCase() === "F5") {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    refreshInputsFromCurrentAep();
                } else if (event.keyName === "Enter" || event.keyName === "Return") {
                    if (event.preventDefault) {
                        event.preventDefault();
                    }
                    handleEnterOpenOrNew(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
                }
            });
        }

        bindEnterOpenOrNew(win);

        showInput.control.onChange = function () {
            refreshEpisodes();
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };

        episodeInput.control.onChange = function () {
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };

        cardInput.control.onChange = function () {
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };

        takeInput.control.onChange = function () {
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };

        cardInput.upButton.onClick = function () {
            changeTrailingNumber(cardInput.control, 1);
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };
        cardInput.downButton.onClick = function () {
            changeTrailingNumber(cardInput.control, -1);
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };
        takeInput.upButton.onClick = function () {
            changeTrailingNumber(takeInput.control, 1);
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };
        takeInput.downButton.onClick = function () {
            changeTrailingNumber(takeInput.control, -1);
            saveCurrentInputs(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };

        openButton.onClick = function () {
            handleOpen(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };

        newButton.onClick = function () {
            handleNew(showInput.control, episodeInput.control, cardInput.control, takeInput.control);
        };

        referenceButton.onClick = function () {
            var referenceMessage = importReferenceAep(showInput.control, episodeInput.control, cardInput.control);
            if (referenceMessage) {
                renderStatus.text = referenceMessage.replace(/[\r\n]+/g, " ");
                renderStatus.helpTip = referenceMessage;
            }
        };

        function refreshInterfaceLanguage() {
            if (win instanceof Window) win.text = SCRIPT_NAME;
            showEpisodeInput.panel.text = T("剧名·集数");
            cardTakeInput.panel.text = T("卡号·版本");
            aerenderButton.text = T("AErender");
            aerenderButton.helpTip = T("将当前已保存的 AE 工程加入 AEP Render 队列；请先打开渲染器。");
            openButton.text = T("打开");
            newButton.text = T("新建");
            referenceButton.text = T("参考");
            renderStatus.text = T("可以右键单击脚本UI空白区域打开设置");
            renderStatus.helpTip = T("可以右键单击脚本UI空白区域打开设置");
            refreshShows();
            try {
                win.layout.layout(false);
                win.layout.resize();
                if (win.update) win.update();
            } catch (refreshError) {}
        }

        var settingsOpen = false;
        function openSettingsFromMouse(event) {
            var isRightClick = event.button === 2 || event.which === 3;
            if (!isRightClick) {
                return;
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (settingsOpen) return;
            settingsOpen = true;
            try { showSettingWindow(refreshInterfaceLanguage); }
            finally { settingsOpen = false; }
        }
        win.addEventListener("mousedown", openSettingsFromMouse, true);
        settingsHitArea.addEventListener("mousedown", openSettingsFromMouse);

        refreshShows();

        // Measure once at the normal size, then allow the host to clip the content.
        renderStatus.visible = false;
        win.layout.layout(true);
        // Match the left column's outer edges; retain the two 6 px gaps.
        // A titled panel's border crosses the middle of its title line.
        var titleLineHeight = showEpisodeInput.panel.graphics.measureString(
            showEpisodeInput.panel.text, showEpisodeInput.panel.graphics.font
        )[1];
        var borderTopOffset = Math.round(titleLineHeight / 2);
        var actionTop = showEpisodeColumn.bounds.top + showEpisodeInput.panel.bounds.top + borderTopOffset;
        var actionHeight = showEpisodeColumn.bounds.bottom - actionTop;
        var actionLeft = buttons.bounds.left;
        var actionWidth = buttons.size.width;
        buttons.bounds = [actionLeft, actionTop, actionLeft + actionWidth, actionTop + actionHeight];
        var actionControls = [openButton, newButton, referenceButton];
        var availableButtonHeight = actionHeight - 2 * buttons.spacing;
        for (var actionIndex = 0; actionIndex < actionControls.length; actionIndex++) {
            var buttonTop = Math.round(availableButtonHeight * actionIndex / 3) + actionIndex * buttons.spacing;
            var buttonBottom = Math.round(availableButtonHeight * (actionIndex + 1) / 3) + actionIndex * buttons.spacing;
            actionControls[actionIndex].bounds = [0, buttonTop, actionWidth, buttonBottom];
        }
        renderStatus.visible = true;
        var statusLeft = inputs.bounds.left;
        var statusTop = inputs.bounds.bottom + 6;
        var statusWidth = inputs.size.width;
        renderStatus.bounds = [statusLeft, statusTop, statusLeft + statusWidth, statusTop + 18];
        if (win instanceof Window) {
            win.size.height = statusTop + 18 + 8;
        }

        function clearMinimumSizes(control) {
            control.minimumSize = [0, 0];
            if (control.children) {
                for (var i = 0; i < control.children.length; i++) {
                    clearMinimumSizes(control.children[i]);
                }
            }
        }
        function resizeSettingsHitArea() {
            settingsHitArea.bounds = [0, 0, Math.max(1, win.size.width), Math.max(1, win.size.height)];
            settingsHitArea.visible = true;
        }
        resizeSettingsHitArea();
        clearMinimumSizes(win);
        // Keep control positions when shrinking instead of remeasuring a minimum size.
        win.layout = {
            layout: function () { clearMinimumSizes(win); resizeSettingsHitArea(); },
            resize: function () { clearMinimumSizes(win); resizeSettingsHitArea(); }
        };
        win.onResizing = win.onResize = function () {
            clearMinimumSizes(this);
            resizeSettingsHitArea();
        };

        return win;
    }

    loadConfig();
    var toolWindow = BuildUI(thisObj);
    if (toolWindow instanceof Window) {
        toolWindow.center();
        toolWindow.show();
    } else {
        toolWindow.layout.layout(true);
    }
})(this);
