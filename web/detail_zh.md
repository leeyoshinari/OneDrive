# OneDrive
## 功能概览
- 文件夹的新建、删除、重命名、移动、导出
- 文件的上传、下载、新建、删除、移动、重命名、分享
- 支持 OnlyOffice (Word、Excel、PowerPoint) 在线编辑和多人协作
- 支持 txt、markdown、xmind脑图、表格、文档的在线编辑功能
- 支持 python 脚本在线编辑和运行
- 支持给文件添加桌面快捷方式
- 支持远程连接 Linux 服务器
- 音乐播放器，支持播放云盘（服务端）和本地（客户端）的音乐
- 集成 aria2，支持 HTTP、FTP、BitTorrent 等多种下载协议
- 增加游戏中心，支持贪吃蛇、俄罗斯方块、套圈圈游戏（会陆续支持更多小游戏）
- 支持多语言，支持配置多语言
- 单点登录，不同用户的数据完全隔离
- 支持 PWA，可以“安装”到手机上
- 可任意挂载多个磁盘


[更多内容详见博客](https://blog.ihuster.top/p/940241891.html)


## 功能介绍
系统的核心功能就是一个网盘，提供了比普通网盘更多的功能——文本等文件的在线编辑功能，且可任意扩展功能，完全开源。在页面上看到的文件和文件夹的目录层级结构在本地服务器/电脑的磁盘里是真实存在的，即使你以后觉得我这个系统不好用了，我也会给你留下一个完整有序的目录文件，而不是乱序的。

### 登录页面
![login.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/login.jpg)

### 页面总概览
桌面背景图片可以在`设置`里更换。
![desktop.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/desktop.jpg)

### 文件资源管理器
上边一排工具栏依次是新建文件、新建文件夹、重命名、移动、复制、上传、下载、分享、删除，这些图标均来源`Windows10`的系统图标。文件列表可按照名称、创建时间、修改时间排序。文件资源管理器中的所有文件，除了支持在线编辑的文件外，其他格式的文件会直接用浏览器打开，浏览器能打开预览的文件可以直接在浏览器中预览，浏览器不支持预览的文件则直接下载到本地。
使用文件上传功能上传文件时，会首先检测网盘是否存在相同的文件，如果存在则不上传，这就是类似一些网盘的秒传的功能。
![file.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/file.jpg)

### 回收站
上边一排工具栏依次是还原文件、删除文件、清空回收站，基本上和`Windows`系统的回收站操作一样。
![garbage.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/garbage.jpg)

### 我的分享
当分享文件时，可设置分享链接的打开次数，超过次数会返回 Nginx 默认页面。其中：markdown、表格、文档 和 xmind 分享链接打开后页面虽然可以编辑，但数据不会保存，仅支持导出数据。
分享功能的常规使用场景是分享文件给别人，还要一个场景就是去打印店打印文档，通过浏览器调用打印机后，刷新页面到指定的次数，这个链接就失效了，有效降低了文档泄漏的风险和使用U盘被病毒感染的风险。
![share.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/share.jpg)

### 设置页面
支持修改密码、退出登陆、上传桌面背景图片、设置主题、窗口透明、选择语言、播放本地视频、ssh。其中上传的桌面背景图片的格式必须是`jpg`。
![setting.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/setting.jpg)

### 计算器
一个很鸡肋的小工具，感觉还不如用 python 命令行计算。<br>
![calc.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/calc.jpg)

### Whiteboard 画板
没事的时候可以用鼠标涂鸦画画，放松一下。
![wihteboard.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/wihteboard.jpg)

### 浏览器
功能简单的浏览器，只支持允许嵌套的网页。经测试，仅支持必应搜索。这里使用的是iframe嵌套的方式，百度和Google搜索不允许 iframe 嵌套，所以用不了；后面可考虑接入后端进行请求转发，解决跨域和嵌套的问题。
![edge.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/edge.jpg)

### 连接 Linux
在`设置`里添加服务器，在列表中点击`打开`即可远程连接 Linux，支持上传和下载文件，支持 `Ctrl+C（复制）` 和 `Ctrl+V（粘贴）` 快捷键，同时 `Ctrl+C` 还保留结束当前进程的功能。为节省服务器资源，对“挂机”超过10分钟的连接进行关闭。
![shell.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/shell1.jpg)
![shell.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/shell2.jpg)

### 播放本地视频
播放本地视频不使用流量，支持记录播放进度；做这个功能的原因是：我的手机上没有安装视频软件，只能用相册自带的功能看视频，但是它记不住播放进度，每次手误碰退出视频，就得重新看，贼麻烦。所以这个功能就是用来记录视频播放进度的。
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/playVideo.jpg)

### 音乐播放器
音乐播放器只支持 `mp3` 格式的歌曲和 `.lrc` 格式的歌词，如果要展示歌词，需要歌曲名和歌词名一样。只有当一首歌播放进度超过`30%`时，才会被添加到播放历史中；歌曲被添加到历史记录中时，播放次数就会加`1`。

打开音乐播放器的方式和在 windows 上使用一样：<br>
1、点击桌面音乐播放器的图标，进入音乐播放器界面，然后导入音乐；<br>
2、进入文件资源管理器，找到`mp3`格式的歌曲，双击打开即可播放刚打开的歌曲；

导入音乐有两个种：一种是从这个云盘导入（选择包含歌曲的文件夹，默认导入文件夹里所有 `mp3` 音乐）；另一种是从本地导入（打开这个网站的电脑或手机上导入，选择文件时，最好把歌曲和歌词都选上）
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/music.jpg)

### Python 命令行
支持 python 命令行，支持导入 python 官方库，可以用来做一些简单的计算，或者处理一些简单的数据。
![python.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/python.jpg)

### Aria2c 下载工具
aria2 是一个轻量级的多协议命令行下载工具，支持HTTP、FTP、BitTorrent等多种协议，支持多连接下载和断点续传。
进入需要下载文件的目录，然后点击 `新建文件 -> 新建下载任务`，在输入框中填入下载的 URL 即可，如果需要 cookie 才能下载，则需要填入 cookie，否则可以不填 cookie。
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/download-new.jpg)

如需查看当前正在下载的任务，点击 `下载列表` 即可。点击`暂停`可以暂停下载任务，点击`取消`可以取消下载，下载完成后，即可在目录里看到下载的文件。
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/download-list.jpg)

### 游戏中心
增加了游戏中心，现支持贪吃蛇、俄罗斯方块游戏，后续会陆续支持其他网页版的小游戏
![snake.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/snake.jpg)

### 多语言设置
目前多语言已支持中文简体和英文，可能存在翻译不正确，或者漏翻译的，请自行修改。

多语言切换有2个地方：一个地方是登陆页面左上角；另一个地方是`设置->个性化->设置语言`。多语言配置分为前端配置和后端配置，前端配置的多语言主要是页面文案展示，后端配置的多语言主要是接口返回信息和日志。如下：<br>
前端多语言配置在 `web->language`目录下面，每一种语言对应一个 json 文件，json 文件里对应的是多语言字段的key和翻译，如需新增多语言，请先复制一份json文件，然后修改翻译，不能修改key。<br>
![language_f.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/language_f.jpg)<br>
后端多语言配置在 `common->messages.py` 文件中，每一个message是一个dict，dict中的每一个key对应一种多语言，如需新增多语言，可直接新增一对 key-value 即可。<br>
![language_b.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/language_b.jpg)

另外新增多语言，还需要在页面下拉框增加选项，在`web->index.html`中有2个地方需要修改：一个是第39 - 42行，另一个是第185 - 188行。**特别注意**：`option中的value`必须要和`web->language`目录下json的文件名一样，也必须要和`common->messages.py`文件中每一个message的key一样。

由于不同语言的长度不一样，如果文案过长导致页面样式不美观，请自行修改。

### OnlyOffice
打开 `office` 文件，会使用 `onlyoffice` 打开，可在线编辑并实时保存，关闭窗口可退出编辑，onlyoffice 默认设置是：用户退出编辑 10s 后，才会自动把文件保存到本地。
多人协作编辑文档：可通过在文件列表中右键获取协作编辑的链接，然后把链接发送给协作编辑的人。如果其中一个用户退出编辑，然后再通过链接进入编辑状态，此时不会协作编辑，必须所有用户全部重新进入编辑状态才可以协作编辑。
查看历史版本：可从历史记录中查看文档的改动，并可从历史记录中恢复。
![word.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/word.jpg)
![excel.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/excel.jpg)
![powerpoint.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/powerpoint.jpg)
![history.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/history.jpg)

### 在线编辑功能
所有在线编辑功能：每隔10秒自动保存，标题栏文件名旁会展示自动保存的时间，点击关闭按钮也会自动保存。其中`txt`、`markdown`和`文档`的在线编辑支持导出成`html`格式，用浏览器打开导出的`html`后，可通过浏览器自带的打印功能把文件转成`PDF`格式。

#### txt 文件
点击右上角的下载按钮，可以直接将当前文档转成 html，并下载。如需下载原 txt文件，可在文件资源管理器中选中文件并点击下载。
![txt.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/txt.jpg)

#### markdown 文件
点击右上角的下载按钮，可以直接将当前文档转成 html，并在新标签页打开，如需下载这个 html，可在新打开的标签页右键下载。需要注意：这里使用的是第三方工具转的html，一些样式在转换时会丢失。如需保留所有的html样式，可在工具栏点击`全窗口预览HTML`即可。
![markdown.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/markdown.jpg)

#### 表格
由于表格功能太多，暂不支持导出功能，可用于在线存储一些数据，可手动复制表格中的数据，并粘贴到本地 excel 表格中。
![sheet.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/sheet.jpg)

#### 文档
该文档左侧带有目录，支持目录定位页面到指定位置。可导出成 html 格式的文件，用浏览器打开 html 文件，调用浏览器自带的打印功能，调整打印页边距，可把文档转成页面布局合适的 PDF 文件。
![docx.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/docx.jpg)

#### xmind 脑图
支持标准的 `xmind` 文件（`xmind8` 和 `xmind zen(xmind 2020)`）在线编辑，文件打开后，原文件格式已经转换，只能通过页面工具栏中的导出功能才能导出 `xmind8`（只支持导出 `xmind8`，不支持导出 `xmind zen`）。在线编辑的脑图中添加的样式、颜色、优先级、完成进度、备注等也支持导出到 `xmind8` 中。
![xmind.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/xmind.jpg)

#### python 脚本
支持在线编辑 py 文件，点击运行后可直接在浏览器上看到结果。如果想导入第三方库，需要专门打包，具体可查阅相关资料。
![pythonEditor.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/pythonEditor.jpg)

## 其他
1、支持 `Linux`、`Windows`、`MacOS` 等多个平台，建议在 `Linux` 系统部署；可尝试在国产操作系统上部署，如有问题，欢迎提出；

2、因为是在操作本地文件，所以不支持集群部署和分布式存储，如需集群部署和分布式存储，[请点我](https://github.com/leeyoshinari/mycloud)；

3、登录页面的背景图片的路径是`web/img/pictures/undefined/background.jpg`，如需修改登录背景图片，可直接替换掉这个图片即可，注意：图片名必须是`background.jpg`；

4、在线播放视频，基本上都是用的是流式播放（边缓存边播放），这就要求视频的元数据必须在视频文件的最前面，而有些视频的元数据在视频文件的末尾，这就需要浏览器把整个视频加载完成后才能播放，体验极差。因此需要手动将视频的元数据移动到视频文件的最前面，然后再上传至云盘，这里使用 [ffmpeg](https://github.com/BtbN/FFmpeg-Builds/releases) 工具移动视频的元数据，命令：`ffmpeg -i input_video.mp4 -map_metadata 0 -c:v copy -c:a copy -movflags +faststart output_video.mp4`。

5、所有页面和操作已尽可能的适配手机端了，使用手机浏览器打开页面，手机横屏展示，使用体验还是不错的；

6、更好的使用体验建议：不管你用的是PC端浏览器还是手机端浏览器，设置浏览器全屏展示，使用体验更好；

## 部署方案
推荐部署方案：
- 带公网IP的云服务器，买云服务器的钱比开百度网盘会员的钱要便宜的多得多，而且有公网IP，还可以干其他很多有趣的事情；
- 树莓派，用于部署网盘服务，可根据自己的需求买对应配置的树莓派，500元左右就可以买一个差不多配置的树莓派了，咸鱼上可能更便宜。树莓派 24h 开机，一个星期的耗电量大约不到1度电；高配置的树莓派还可以用来当电脑、电视、机顶盒用哦，就看你的动手能力有多强了；
- 硬盘，自己可以买一个几T的机械硬盘存储数据，现在机械硬盘也很便宜；土豪可以用固态硬盘，也不是很贵；
- 内网穿透，在云服务器和树莓派上分别部署内网穿透软件即可，推荐使用 frp 进行内网穿透；

可选部署方案：
- 树莓派 + 硬盘；
- 公网IP，可以让宽带运营商给你一个固定/动态的公网IP（IPv4就不用想了，运营商肯定不会给，可以使用IPv6）；
- 域名，由于IPv6很难记，所以还需要购买一个域名（便宜的域名一年也就不到8元）；
- 动态域名解析，宽带运营商如果给你一个固定的公网IP，那样就很不安全，动态公网IP会安全一些，这就需要动态域名解析；

其他部署：
如果你没有随时随地使用的需求，只是在局域网内用着玩，那你就随便找个电脑部署就行了；

以上，你的个人数据安全是可以得到保障的，并且拥有了比市面上的商业网盘更多的功能，也再也不用担心自己的视频变成8秒教育片了；不仅如此，你还可以自己开发，扩展功能。
