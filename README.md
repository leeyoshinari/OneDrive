# OneDrive
本项目是一个个人版的网盘，具备了网盘应有的基本功能，所有数据存在自己的磁盘里；和内网穿透搭配使用效果更佳。

## 功能
- 文件夹的新建、删除、重命名、移动、导出<br>
- 文件上传、下载、新建、删除、移动、重命名、分享<br>
- txt文档在线预览和编辑功能<br>
- 不同用户的数据完全隔离<br>
- 可任意挂载多个磁盘<br>

## 技术选型
- 后端框架：FastApi<br>
- 数据库：MySQL<br>
- 前端：原生 html + js + css (使用的是[这个项目](https://github.com/tjy-gitnub/win12))<br>

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

5、修改`web/login.js`文件中的第二行，此处的值需要和配置文件`config.conf`中的`prefix`一样；

6、启动服务；
```shell script
sh startup.sh
```

7、创建账号；
为了避免被其他人恶意创建账号，页面未放开创建账号的入口；为了方便使用，特意改成直接在浏览器地址栏中输入url创建用户。可在`main.py`文件中的第58行修改成你专属的url路径。<br>
```shell script
http://IP:Port/配置文件中的prefix/user/test/createUser?username=用户名&password=密码&password1=再次确认密码`
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
     proxy_set_header X-Real-IP $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```
通常nginx会限制请求体大小，需要增加配置`client_max_body_size 4096M;`，还有其他超时时间的配置，可自行上网查找资料修改；

nginx安装非常简单，请去[nginx 官方网站](http://nginx.org/en/download.html)下载对应的nginx安装包安装。安装完成后用本项目中的`nginx.conf`替换掉安装完成后的`nginx.conf`即可。

9、访问页面，url是 `http://IP:Port/OneDrive`（这里的 IP 和 端口是 Nginx 中设置的 IP 和 端口。`OneDrive`就是第8步中的前端配置的名字）
![]()

10、如果想把当前服务器上已有的文件导入系统中，可访问后台 api 接口页面，找到 `file/import` 接口，请求参数分别是需要导入的文件夹的绝对路径和目标的目录Id。

## 其他
1、支持 Linux、Windows、MacOS 等系统； 

2、因为是在操作本地文件，所以不支持集群部署和分布式存储，如需集群部署和分布式存储，[请点我](https://github.com/leeyoshinari/mycloud)；

3、登录页面的背景图片的路径是`web/img/pictures/undefined/back.jpg`，如需修改登录背景图片，可直接替换掉这个图片即可，注意：图片名必须是`back.jpg`；

4、桌面的背景图片默认和登录页面的背景图片一样，如需修改，可在`设置->个性化->设置背景图片`中上传，上传成功后，清缓存刷新页面即可，注意：图片格式必须是`jpg`；

5、`txt` 和 `markdown` 文档支持在线编辑，每隔10秒自动保存，点击关闭按钮也会自动保存，再也不用担心文件没有保存了；
