# OneDrive
本项目是一个个人版的网盘，具备了网盘应有的基本功能，所有数据存在自己的磁盘里；和内网穿透搭配使用效果更佳。

## 功能
- 文件夹的新建、删除、重命名、移动、导出
- 文件上传、下载、新建、删除、移动、重命名、分享
- txt和markdown文档的在线预览和编辑功能
- 支持 xmind 文件在线预览和编辑
- 支持表格在线编辑
- 支持在线文档编辑
- 不同用户的数据完全隔离
- 可任意挂载多个磁盘

### ToDo
- [ ] 支持chatGPT等大模型
- [ ] 音乐播放器

## 技术选型
- 后端框架：FastApi<br>
- 数据库：SQLite3 or MySQL<br>
- 前端：原生 html + js + css<br>

## 实现方案
文件和文件夹的层级结构维护在数据库中，这样在页面查询列表时，只需要查询数据库就可以了，速度会快很多；同时数据库中的文件和文件夹的层级结构也全部真实的映射到磁盘里，所见即所得，便于以后这个系统不用了也保留完整有序的文件，而不是乱序的。
- 查询文件和文件夹时，直接在数据库中查询，可以非常方便的进行过滤和排序，只有在读写文件和文件夹时，才会和磁盘交互，有效的降低了磁盘IO。
- 所有文件和文件夹的数据通过 id 查询，页面上只能看到相对路径，完全隐藏了本地真实的文件路径。
- 可以很方便的“挂载”磁盘，只需要在配置文件中将新磁盘配置上就行了。
- 搭配大家都熟悉的 Windows 文件系统的页面交互(来源Windows12概念图)，前端页面使用的是这个项目[tjy-gitnub](https://github.com/tjy-gitnub/win12)，非常感谢作者。我只是在这个项目的基础上进行了大量的增删，仅保留和云盘相关的部分。

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

5、启动服务；
```shell script
sh startup.sh
```

6、创建账号；
为了避免被其他人恶意创建账号，页面未放开创建账号的入口；为了方便使用，特意改成直接在浏览器地址栏中输入url创建用户。可在`main.py`文件中的第58行修改成你专属的url路径。
```shell script
http://IP:Port/配置文件中的prefix/user/test/createUser?username=用户名&password=密码&password1=再次确认密码`
```

7、配置并启动 `nginx`，location相关配置如下：<br>
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
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
通常nginx会限制请求体大小，需要增加配置`client_max_body_size 4096M;`，还有其他超时时间的配置，可自行上网查找资料修改；

如果你不了解 nginx，请先去[nginx 官方网站](http://nginx.org/en/download.html)下载对应系统的nginx安装包，并按照网上的教程安装。安装完成后用本项目中的`nginx.conf`替换掉安装完成后的`nginx.conf`，然后重启nginx即可。

8、访问页面，url是 `http://IP:Port/OneDrive`（这里的 IP 和 端口是 Nginx 中设置的 IP 和 端口。`OneDrive`就是第8步中的前端配置的名字）
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/login.jpg)
![](https://github.com/leeyoshinari/OneDrive/blob/main/web/img/pictures/home.jpg)

9、如果想把当前服务器上已有的文件导入系统中，可访问后台 api 接口页面，找到 `file/import` 接口，请求参数分别是需要导入的文件夹的绝对路径和目标的目录Id。

## 在线编辑功能
所有在线编辑功能：每隔10秒自动保存，标题栏文件名旁会展示自动保存的时间，点击关闭按钮也会自动保存。其中`txt`、`markdown`和`文档`的在线编辑支持导出成`html`格式，用浏览器打开导出的`html`后，可通过浏览器自带的打印功能把文件转成`PDF`格式。

### txt 文件
点击右上角的下载按钮，可以直接将当前文档转成 html，并下载。如需下载原 txt文件，可在文件资源管理器中选中文件并点击下载。

### markdown 文件
点击右上角的下载按钮，可以直接将当前文档转成 html，并在新标签页打开，如需下载这个 html，可在新打开的标签页右键下载。需要注意：这里使用的是第三方工具转的html，一些样式在转换时会丢失。如需保留所有的html样式，可在工具栏点击`全窗口预览HTML`即可。

### 表格
由于表格功能太多，暂不支持导出功能，可用于在线存储一些数据。

## 文档
该文档左侧带有目录，支持目录定位页面到指定位置。可导出成 html 格式的文件，用浏览器打开 html 文件，调用浏览器自带的打印功能，调整打印页边距，可把文档转成页面布局合适的 PDF 文件。

### xmind 脑图
支持标准的 `xmind` 文件（`xmind8` 和 `xmind zen(xmind 2020)`）在线编辑，文件打开后，原文件格式已经转换，只能通过页面工具栏中的导出功能才能导出 `xmind8`（只支持导出 `xmind8`，不支持导出 `xmind zen`）。在线编辑的脑图中添加的样式、颜色、优先级、完成进度、备注等也支持导出到 `xmind8` 中。

## 文件分享
文件分享链接支持设置打开次数，超过次数会返回 Nginx 默认页面。其中：markdown、表格、文档 和 xmind 分享链接打开后页面虽然可以编辑，但数据不会保存，仅支持导出数据。

## 其他
1、支持 Linux、Windows、MacOS 等多个平台，建议在 Linux 系统部署； 

2、因为是在操作本地文件，所以不支持集群部署和分布式存储，如需集群部署和分布式存储，[请点我](https://github.com/leeyoshinari/mycloud)；

3、登录页面的背景图片的路径是`web/img/pictures/undefined/back.jpg`，如需修改登录背景图片，可直接替换掉这个图片即可，注意：图片名必须是`back.jpg`；

4、桌面的背景图片默认和登录页面的背景图片一样，如需修改，可在`设置->个性化->设置背景图片`中上传，上传成功后，清缓存刷新页面即可，注意：图片格式必须是`jpg`；


## 鸣谢
鸣谢以下项目
- [win12](https://github.com/tjy-gitnub/win12)
- [viewerjs](https://github.com/fengyuanchen/viewerjs)
- [kityminder](https://github.com/fex-team/kityminder)
- [editor.md](https://github.com/pandao/editor.md)
- [markdown-it](https://github.com/markdown-it/markdown-it)
- [Luckysheet](https://github.com/dream-num/Luckysheet)
- [wangEditor](https://github.com/wangeditor-team/wangEditor)
