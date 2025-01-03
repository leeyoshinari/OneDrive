# OneDrive
[English Document](https://github.com/leeyoshinari/OneDrive/blob/main/README.md)

[更多内容详见博客](https://blog.ihuster.top/p/940241891.html)

## 功能
- 文件夹的新建、删除、重命名、移动、导出
- 文件的上传、下载、新建、删除、移动、重命名、分享
- 支持 OnlyOffice (Word、Excel、PowerPoint) 在线编辑和多人协作
- 支持 txt、markdown、xmind脑图、表格、文档的在线编辑功能
- 支持 python 脚本在线编辑和运行
- 支持给文件添加桌面快捷方式
- 支持远程连接 Linux 服务器
- 音乐播放器，支持播放云盘（服务端）和本地（客户端）的音乐
- 支持 KTV，自建曲库，想唱就唱
- 集成 aria2，支持 HTTP、FTP、BitTorrent 等多种下载协议
- 增加游戏中心，支持贪吃蛇、俄罗斯方块、套圈圈游戏（会陆续支持更多小游戏）
- 支持多语言，支持配置多语言
- 单点登录，不同用户的数据完全隔离
- 支持 PWA，可以“安装”到手机上
- 可任意挂载多个磁盘

查看详细页面样式，[请点我](https://github.com/leeyoshinari/OneDrive/blob/main/web/detail_zh.md)


## 技术选型
- 后端框架：FastApi<br>
- 数据库：SQLite3 or MySQL<br>
- 前端：html + js + css<br>

## 实现方案
文件和文件夹的层级结构维护在数据库中，这样在页面查询列表时，只需要查询数据库就可以了，速度会快很多；同时数据库中的文件和文件夹的层级结构也全部真实的映射到磁盘里，所见即所得，便于以后这个系统不用了也保留完整有序的文件，而不是乱序的。
- 查询文件和文件夹时，直接在数据库中查询，可以非常方便的进行过滤和排序，只有在读写文件和文件夹时，才会和磁盘交互，有效的降低了磁盘IO。
- 所有文件和文件夹的数据通过 id 查询，页面上只能看到相对路径，完全隐藏了本地真实的文件路径。
- 可以很方便的“挂载”磁盘，只需要在配置文件中将新磁盘配置上就行了。
- 搭配大家都熟悉的 Windows 文件系统的页面交互(来源Windows12概念图)，前端页面使用的是这个项目[tjy-gitnub](https://github.com/tjy-gitnub/win12)，非常感谢作者。我只是在这个项目的基础上进行了大量的增删（删除了大量的静态代码和缓存数据的代码，提高了整个页面的加载速度，并把大量的功能变成真实有用的功能）。

## 部署
1、克隆 `git clone https://github.com/leeyoshinari/OneDrive.git` ；

2、进入目录 `cd OneDrive`，修改配置文件`config.conf`；

3、安装第三方包
```shell script
pip3 install -r requirements.txt
```

4、初始化数据库，依次执行下面命令；
```shell script
aerich init -t settings.TORTOISE_ORM
aerich init-db
```

5、安装文件下载工具 [aria2](https://github.com/aria2/aria2/releases)，执行 `aria2c -v` 验证是否安装成功。

6、启动服务；
```shell script
sh startup.sh
```

7、创建账号；
为了避免被其他人恶意创建账号，页面未放开创建账号的入口；可以通过在API接口文档中创建用户，进入 swagger-ui 页面，找到 `createUser` 接口即可。
```shell script
http://IP:Port/配置文件中的prefix/swagger-ui
```

8、配置并启动 `nginx`，location相关配置如下：<br>
（1）前端配置：前端文件在 `web` 目录里, `/OneDrive`可任意修改成你喜欢的名字
```shell script
location /OneDrive {
    alias /home/OneDrive/web/;
    index  index.html;
}
```
（2）后端请求：`proxy_pass`是配置文件`config.conf`中的 IP 和 端口, `/mycloud`必须和`config.conf`中的`prefix`一样
```shell script
location /mycloud {
     proxy_pass  http://127.0.0.1:15200;
     proxy_set_header Host $proxy_host;
     proxy_set_header lang $http_lang;
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header Upgrade $http_upgrade;
	 proxy_set_header Connection $proxy_connection;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
（3）在 `http` 模块中，需要添加一个映射关系
```shell
map $http_upgrade $proxy_connection {
    default upgrade;
    "" close;
}
```
（4）Swagger 接口页面
```shell
location /api/openapi {
    proxy_pass  http://127.0.0.1:15200;
}
```

通常nginx会限制请求体大小，需要增加配置`client_max_body_size 4096M;`，还有其他超时时间的配置，可自行上网查找资料修改；

如果你不了解 nginx，请先去[nginx 官方网站](http://nginx.org/en/download.html)下载对应系统的nginx安装包，并按照网上的教程安装。安装完成后用本项目中的`nginx.conf`替换掉安装完成后的`nginx.conf`，然后重启nginx即可。如果你使用的是`https`，直接修改端口并配置 ssl 即可。

9、访问页面，url是 `http://IP:Port/OneDrive`（这里的 IP 和 端口是 Nginx 中设置的 IP 和 端口。`OneDrive`就是第7步中的前端配置的名字）
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/login.jpg)
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/home.jpg)

10、如果想把当前服务器上已有的文件导入系统中，可访问后台 api 接口页面，找到 `file/import` 接口，请求参数分别是需要导入的文件夹的绝对路径和目标的目录Id。

11、如需配置多语言，[请点我](https://github.com/leeyoshinari/OneDrive/blob/main/web/detail_zh.md) 。

12、如需了解更多，[请点我](https://github.com/leeyoshinari/OneDrive/blob/main/web/detail_zh.md) 。

## 其他
1、支持 `Linux`、`Windows`、`MacOS` 等多个平台，建议在 `Linux` 系统部署； 

2、因为是在操作本地文件，所以不支持集群部署和分布式存储，如需集群部署和分布式存储，[请点我](https://github.com/leeyoshinari/mycloud)；

3、登录页面的背景图片的路径是`web/img/pictures/undefined/background.jpg`，如需修改登录背景图片，可直接替换掉这个图片即可，注意：图片名必须是`background.jpg`；

4、桌面的背景图片默认和登录页面的背景图片一样，如需修改，可在`设置->个性化->设置背景图片`中上传，上传成功后，清缓存刷新页面即可，注意：图片格式必须是`jpg`；

5、目前多语言已支持中文简体和英文，如有翻译不正确，或者漏翻译的，烦请告知。多语言已完全放开，可自行配置；

6、在线播放视频，基本上都是用的是流式播放（边缓存边播放），这就要求视频的元数据必须在视频文件的最前面，而有些视频的元数据在视频文件的末尾，这就需要浏览器把整个视频加载完成后才能播放，体验极差。因此需要手动将视频的元数据移动到视频文件的最前面，然后再上传至云盘，这里使用 [ffmpeg](https://github.com/BtbN/FFmpeg-Builds/releases) 工具移动视频的元数据，命令：`ffmpeg -i input_video.mp4 -map_metadata 0 -c:v copy -c:a copy -movflags +faststart output_video.mp4`。

7、所有页面和操作已尽可能的适配手机端了，使用手机浏览器打开页面，手机横屏展示，使用体验还是不错的；

8、更好的使用体验建议：不管你用的是PC端浏览器还是手机端浏览器，设置浏览器全屏展示，使用体验更好；

## 鸣谢
鸣谢以下项目
- [win12](https://github.com/tjy-gitnub/win12)
- [i18next](https://github.com/i18next/i18next)
- [viewerjs](https://github.com/fengyuanchen/viewerjs)
- [kityminder](https://github.com/fex-team/kityminder)
- [editor.md](https://github.com/pandao/editor.md)
- [Luckysheet](https://github.com/dream-num/Luckysheet)
- [wangEditor](https://github.com/wangeditor-team/wangEditor)
- [优折美在线音乐播放器](https://m.uzz.me)
- [snake](https://github.com/SunQQQ/snake)
