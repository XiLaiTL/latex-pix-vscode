# LaTeX-Pix: Convert Screenshots to LaTeX Code

LaTeX-Pix：将公式截图转换为LaTeX代码的VSCode插件

- Fork from: https://github.com/lucasvanmol/obsidian-latex-ocr
- Backend: https://github.com/XiLaiTL/latex-pix-backend/
- Model: https://huggingface.co/MixTex/ZhEn-Latex-OCR

## Features

+ 剪贴板图像转LaTeX：直接从剪贴板粘贴截图，并将其转换为LaTeX代码。（命令：`latex-pix.paste-latex-from-clipboard`）
+ 支持文件路径转LaTeX：从计算机上的图像文件位置转换LaTeX代码。（命令：`latex-pix.paste-latex-from-path`）

初次启动请等待右下角

## Requirements

[vscode-toolbar](vscode:extension/XiLaiTL.vscode-toolbar)：可选，LaTeX工具箱支持，可以免去用命令的烦恼。

## Extension Settings


### `latex-pix.ocr.activate`

此配置项用于激活LaTeX OCR（光学字符识别）功能。要启用LaTeX OCR，会自动下载相应的模型。

- **类型**：布尔值（boolean）
- **默认值**：`true`，表示默认情况下OCR功能是激活的。

### `latex-pix.ocr.delimiters`

此配置项用于指定LaTeX代码周围的分隔符。在LaTeX中，数学模式通常使用`$`或`$$`来标识。这个配置项允许用户自定义这些分隔符，以适应不同的排版需求。

- **类型**：字符串（string）
- **默认值**：`$$`，表示默认情况下使用双美元符号作为数学模式的分隔符。

### `latex-pix.ocr.pythonPath`

此配置项用于指定Python安装路径或`latex-pix-server`的安装路径。`latex-pix`插件需要调用Python脚本或者`latex-pix-server`来执行OCR任务，因此需要正确配置路径。

- **类型**：字符串（string）
- **默认值**：`python3`，表示使用内置的环境。

### `latex-pix.ocr.cacheDirPath`

此配置项用于指定本地模型的缓存路径。当`latex-pix`插件需要下载或更新OCR模型时，这些模型将被缓存到指定的路径下。

- **类型**：字符串（string）
- **默认值**：空字符串（`""`），表示默认情况下模型将被缓存到插件文件夹下的某个子目录中。用户可以根据需要自定义缓存路径。

### `latex-pix.ocr.port`

此配置项用于指定`latex-pix-server`的端口号。`latex-pix-server`是一个后台服务，用于处理OCR任务。这个配置项允许用户自定义服务器监听的端口号。

- **类型**：字符串（string
- **默认值**：`50051`，表示默认情况下服务器将监听50051端口。如果端口已被占用或用户希望使用其他端口，可以修改此配置项的值。

## Known Issues

不能结束掉latex-pix-server进程！得手动停掉。

## Release Notes

### 0.0.2

First Version.