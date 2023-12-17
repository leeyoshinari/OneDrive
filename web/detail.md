# OneDrive
## Function
- Create, Delete, Rename, Move, and Export folders
- Upload, Download, Create, Delete, Move, Rename, and Share files
- Supports online editing functions of txt, markdown, xmind, sheet, and document
- Support online editing and running of python scripts
- Support remote connection to Linux server
- Supports multiple languages and supports configuration of multiple languages
- Single sign-on, data of different users is completely isolated
- Multiple disks can be mounted arbitrarily

## Introduction
The core function is a network disk, which provides more functions - online editing, and can be arbitrarily expanded. It is completely open source. The directory hierarchy of files and folders you see on the page actually exists on the local server/computer disk. Even if you find the system difficult to use in the future, it will also leave you with a directory file that is completely in order, not out of order.

### Login Page
![login.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/login.jpg)

### Page Overview
The desktop background image can be changed in `Setting`.
![desktop.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/desktop.jpg)

### Windows File Explorer
The top row of toolbars are New File, New Folder, Rename, Move, Copy, Upload, Download, Share, and Delete. All icons are system icons of Windows 10. The file can be sorted by name, createTime, and updateTime. All files in the file explorer, except for files that support online editing, files in other formats will be opened directly in the browser. Files that the browser support preview can be previewed directly in the browser, and files that the browser does not support preview can be directly downloaded.<br>
When using the file upload function to upload a file, it will first check whether the same file exists, and if exists, it will not be uploaded.
![file.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/file.jpg)

### Recycle Bin
The top row of toolbars are restoring files, deleting files, and emptying the Recycle Bin.
![garbage.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/garbage.jpg)

### My Share
When sharing file, you can set the number of times the shared link is opened. If the number is exceeded, the Nginx default page will be returned. Although the page can be edited after the shared link of markdown, sheet, document and xmind is opened, the data will not be saved, and only export data is supported.
![share.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/share.jpg)

### Setting
Supports modifying passwords, logging out, uploading background images, setting themes, setting multiple languages, playing local videos, and ssh.
![setting.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/setting.jpg)

### Calculator
![calc.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/calc.jpg)

### Whiteboard
![wihteboard.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/wihteboard.jpg)

### Microsoft Edge
A simple browser that only supports nested web pages. After testing, only Bing search is supported. Google and Baidu search do not allow iframe nesting, so they cannot be used; Later The backend forwards requests can be considered to solve cross-domain and nested problems.
![edge.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/edge.jpg)

### Connect Linux
Add the server in `Setting` and click `Open` in the list to connect to Linux remotely. Supports uploading and downloading files, supports `Ctrl+C (copy)` and `Ctrl+V (paste)` shortcut keys, at the same time, `Ctrl+C` also retains the function of ending the current process. To save server resources, connections that have been "hanging up" for more than 10 minutes will be closed.
![shell.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/shell1.jpg)
![shell.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/shell2.jpg)

### Play local video
Playing local videos does not use traffic and supports recording playback progress.
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/playVideo.jpg)

### Python
Supports python command line and supports importing python official libraries, it can be used to do some simple calculations or deal some simple data.
![python.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/python.jpg)

### Multi-language settings
Currently, multiple languages support Simplified Chinese and English. There may be incorrect translations or missing translations, please modify them yourself.

There are two places for multi-language switching: one is the upper left corner of the login page; the other is`Setting->Personalized->Language setting`. <br>
Multi-language configuration is divided into front-end configuration and back-end configuration. The configuration of the front-end is mainly for page copywriting display, and the configuration of the back-end is mainly for interface return information and logs, as follows:<br>
The front-end multi-language configuration is in `web->language` directory. Each language corresponds to a json file. The json file contains the keys and translations. If you need to add multiple languages, please copy a json file first, and then modify the translation. The key cannot be modified.<br>
![language_f.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/language_f.jpg)<br>
The backend multi-language configuration is in the `common->messages.py` file. Each message is a dict, and each key in the dict corresponds to a language. If you need to add multiple languages, you can directly add a key-value pair.<br>
![language_b.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/language_b.jpg)

In addition, when adding multiple languages, you need to add options in the page drop-down box. There are two places in `web->index.html` that need to be modified: one is lines 39-42, and the other is lines 185-188. <br>
**Special Note**: The `value in option` must be the same as the json file name in the `web->language`, and must also be the same as the key of each message in the `common->messages.py` file.

Due to the length of different languages is different, if the copywriting is too long and the page style is not beautiful, please modify it yourself.

### Online Editing
All online editing functions: Automatically save every 10 seconds, the automatic save time will be displayed next to the file name in the title bar, clicking the close button will also save automatically. Online editing of `txt`, `markdown` and `document` supports exporting to `html` format. After opening the exported `html` with browser, the file can be converted into `PDF` format through the browser's built-in printing function.

#### txt
Click the download button in the upper right corner to directly convert the current document into html and download it. If you want to download the original txt file, select the file in the file explorer and click download.
![txt.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/txt.jpg)

#### Markdown
Click the download button in the upper right corner to directly convert the current document into html and open it in a new tab. If you want to download this html, you can right-click on the newly opened tab to download. Note: The HTML is converted by a third-party tool, and some styles will be lost during conversion.
![markdown.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/markdown.jpg)

#### Sheet
Due to the sheet has too many functions, the export function is not supported, it can be used to store some data online. The data in the sheet can be manually copied and pasted into a local excel file.
![sheet.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/sheet.jpg)

#### Document
There is a table of contents on the left side of the document, and you can click the table of contents to locate the page to the specified location. It can be exported to html format, open the html file with a browser, call the browser's built-in printing function, adjust the printing margins, and convert the document into a PDF file with a suitable page layout.
![docx.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/docx.jpg)

#### xmind
Support online editing of standard `xmind` files (`xmind8` and `xmind zen(xmind 2020)`). After the file is opened, the original file format has been converted and can only be exported to `xmind8` through the export function in the page (only exporting `xmind8` is supported, exporting `xmind zen` is not supported). Styles, colors, priorities, completion progress, notes, etc. also support exporting to `xmind8`.
![xmind.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/xmind.jpg)

#### Python script
Supports online editing of py files, and you can see the results directly on the browser after clicking to run. If you want to import a third-party library, you need to package it specially.
![pythonEditor.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/pythonEditor.jpg)

## Others
1.Supports multiple platforms such as `Linux`, `Windows`, `MacOS`, etc. It is recommended to deploy on `Linux`.

2.Cluster deployment and distributed storage are not supported. If you need cluster deployment and distributed storage, [Please click me](https://github.com/leeyoshinari/mycloud).

3.The path of the background image of the login page is `web/img/pictures/undefined/background.jpg`. If you need to modify the login background image, you can directly replace this image. Note: the image name must be `background.jpg`.

4.The background image of the desktop is the same as the background image of the login page by default. If you need to modify it, you can upload it in `Setting->Personalized->Set background image`. After the upload is successful, clear the cache and refresh the page. Note: The image format must be `jpg`.

5.Playing videos online uses streaming playback, which requires that the metadata of the video must be at the front of the video file. So, you need to manually move the metadata of the video to the front of the video file. Using the [ffmpeg](https://github.com/BtbN/FFmpeg-Builds/releases) to move the metadata of the video. The command: `ffmpeg -i input_video.mp4 -map_metadata 0 -c:v copy -c:a copy -movflags +faststart output_video.mp4`.

6.All pages and operations have been adapted to the mobile phone as much as possible. Use the mobile browser to open the page and display it horizontally on the mobile phone, the user experience is still good.

7.Whether you are using a PC browser or a mobile browser, setting the browser to display in full screen will provide a better user experience.

## Deployment
Recommended deployment solution:
- Cloud server with public IP.
- Raspberry Pi is used to deploy network disk services. You can buy a Raspberry Pi with corresponding configuration according to your own needs.
- Hard drive, you can buy a mechanical hard drive to store data.
- NAT traversal, Just deploy NAT traversal software on the cloud server and Raspberry Pi respectively. It is recommended to use frp.


Above, you have a secure personal network disk with more functions than a commercial network disk. Not only that, you can also develop and expand the functions yourself.
