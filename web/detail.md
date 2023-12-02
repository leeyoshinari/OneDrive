## 功能概览
- 文件夹的新建、删除、重命名、移动、导出
- 文件上传、下载、新建、删除、移动、重命名、分享
- 支持 txt、markdown、xmind、表格、文档的在线编辑功能
- 支持远程连接 Linux 服务器
- 单点登录，不同用户的数据完全隔离
- 可任意挂载多个磁盘

## 功能介绍
系统的核心功能就是一个网盘，提供了比普通网盘更多的功能——文本等文件的在线编辑功能，且可任意扩展功能，完全开放。在页面上看到的文件和文件夹的目录层级结构在本地服务器/电脑的磁盘里是真实存在的，即使你以后觉得我这个系统不好用了，我也会给你留下一个完整有序的目录文件，而不是乱序的。

### 登录页面
![login.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/login.jpg)

### 页面总概览
![desktop.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/desktop.jpg)

### 文件资源管理器
![file.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/file.jpg)
上边一排工具栏依次是新建文件、新建文件夹、重命名、移动、复制、上传、下载、分享、删除。文件列表可按照名称、创建时间、修改时间排序。
使用文件上传功能上传文件时，会首先检测网盘是否存在相同的文件，如果存在则不上传，这就是类似百度网盘的秒传的功能。

### 回收站
![garbage.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/garbage.jpg)
上边一排工具栏依次是还原文件、删除文件、清空回收站。

### 我的分享
![share.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/share.jpg)
文件分享链接支持设置打开次数，超过次数会返回 Nginx 默认页面。其中：markdown、表格、文档 和 xmind 分享链接打开后页面虽然可以编辑，但数据不会保存，仅支持导出数据。

### 设置页面
![setting.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/setting.jpg)
支持修改密码、退出登陆、上传背景图片、设置主题、播放本地视频、ssh。

### 计算器
![calc.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/calc.jpg)<br>
一个感觉很鸡肋的小工具。

### Whiteboard 画板
![wihteboard.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/wihteboard.jpg)<br>
没事可以用鼠标涂鸦画画。

## 在线编辑功能
所有在线编辑功能：每隔10秒自动保存，标题栏文件名旁会展示自动保存的时间，点击关闭按钮也会自动保存。其中`txt`、`markdown`和`文档`的在线编辑支持导出成`html`格式，用浏览器打开导出的`html`后，可通过浏览器自带的打印功能把文件转成`PDF`格式。

### txt 文件
![txt.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/txt.jpg)
点击右上角的下载按钮，可以直接将当前文档转成 html，并下载。如需下载原 txt文件，可在文件资源管理器中选中文件并点击下载。

### markdown 文件
![markdown.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/markdown.jpg)
点击右上角的下载按钮，可以直接将当前文档转成 html，并在新标签页打开，如需下载这个 html，可在新打开的标签页右键下载。需要注意：这里使用的是第三方工具转的html，一些样式在转换时会丢失。如需保留所有的html样式，可在工具栏点击`全窗口预览HTML`即可。

### 表格
![sheet.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/sheet.jpg)
由于表格功能太多，暂不支持导出功能，可用于在线存储一些数据。

### 文档
![docx.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/docx.jpg)
该文档左侧带有目录，支持目录定位页面到指定位置。可导出成 html 格式的文件，用浏览器打开 html 文件，调用浏览器自带的打印功能，调整打印页边距，可把文档转成页面布局合适的 PDF 文件。

### xmind 脑图
![xmind.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/xmind.jpg)
支持标准的 `xmind` 文件（`xmind8` 和 `xmind zen(xmind 2020)`）在线编辑，文件打开后，原文件格式已经转换，只能通过页面工具栏中的导出功能才能导出 `xmind8`（只支持导出 `xmind8`，不支持导出 `xmind zen`）。在线编辑的脑图中添加的样式、颜色、优先级、完成进度、备注等也支持导出到 `xmind8` 中。

### python 脚本
![python.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/python.jpg)
仅支持 python 命令行，支持导入 python 官方库，可以用来做一些简单的计算，或者处理一些简单的数据。

![pythonEditor.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/pythonEditor.jpg)
支持在线编辑 py 文件，点击运行后可直接在浏览器上看到结果。如果想导入第三方库，需要专门打包，具体可查阅相关资料。

## 连接 Linux
![shell.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/shell1.jpg)
![shell.jpg](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/shell2.jpg)
在`设置`里添加服务器，在列表中点击`打开`即可远程连接 Linux，支持上传和下载文件，支持 `Ctrl+C（复制）` 和 `Ctrl+V（粘贴）` 快捷键，同时 `Ctrl+C` 还保留结束当前进程的功能。为节省服务器资源，对“挂机”超过10分钟的连接进行关闭。

## 播放本地视频
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/playVideo.jpg)
播放本地视频不使用流量，支持记录播放进度；用手机打开网站播放本地视频时，部分浏览器不支持倍速播放。做这个功能的原因是：我的手机上没有安装视频软件，只能用相册自带的功能看视频，但是它记不住播放进度，每次手误碰退出视频，就得重新看，贼麻烦。

播放在线视频，支持流式播放（边缓存边播放），快进/快退也是从指定位置加载视频，减少流量消耗。

## 其他
1、因为是在操作本地文件，所以不支持集群部署和分布式存储，如需集群部署和分布式存储，[请点我](https://github.com/leeyoshinari/mycloud)；

2、和内网穿透搭配使用体验更佳；把开百度会员的钱，或者开在线文档会员的钱，拿去买一个带公网IP的云服务器，全部私有化部署，文件隐私安全绝对可以保障。现在云服务器厂商的云服务真的非常便宜。

## 部署
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

以上，你的云盘数据安全是可以得到保障的，并且拥有了比市面上的商业网盘更多的功能，也再也不用担心自己的视频变成8秒教育片了；不仅如此，你还可以自己开发，扩展功能。
