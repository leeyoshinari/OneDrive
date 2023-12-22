let params = window.location.href.split('&');
let servers = params[0].split('=')[1];
let file_id = params[1].split('=')[1];
var isMobile = {
    Android: function() {  
        return navigator.userAgent.match(/Android/i) ? true : false;  
    },  
    BlackBerry: function() {  
        return navigator.userAgent.match(/BlackBerry/i) ? true : false;  
    },  
    iOS: function() {  
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;  
    },  
    Windows: function() {  
        return navigator.userAgent.match(/IEMobile/i) ? true : false;  
    },  
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Windows());  
    }
};

$(function(){
    rem.isMobile = false;//isMobile.any();      // 判断是否是移动设备
    rem.webTitle = document.title;      // 记录页面原本的标题
    rem.errCount = 0;                   // 连续播放失败的歌曲数归零
    
    initProgress();     // 初始化音量条、进度条（进度条初始化要在 Audio 前，别问我为什么……）
    initAudio();    // 初始化 audio 标签，事件绑定
    if(rem.isMobile) {  // 加了滚动条插件和没加滚动条插件所操作的对象是不一样的
        rem.sheetList = $("#sheet");
        rem.mainList = $("#main-list");
    } else {
        // 滚动条初始化(只在非移动端启用滚动条控件)
        $("#main-list,#sheet").mCustomScrollbar({
            theme:"minimal",
            advanced:{
                updateOnContentResize: true // 数据更新后自动刷新滚动条
            }
        });
        
        rem.sheetList = $("#sheet .mCSB_container");
        rem.mainList = $("#main-list .mCSB_container");  
    }
    
    addListhead();  // 列表头
    addListbar("loading");  // 列表加载中
    
    // 顶部按钮点击处理
    $(".btn").click(function(){
        switch($(this).data("action")) {
            case "player":    // 播放器
                dataBox("player");
            break;
            case "playing": // 正在播放
                loadList(1); // 显示正在播放列表
            break;
            
            case "sheet":   // 播放列表
                dataBox("sheet");    // 在主界面显示出音乐专辑
            break;
        }
    });
    
    // 列表项双击播放
    $(".music-list").on("dblclick",".list-item", function() {
        var num = parseInt($(this).data("no"));
        if(isNaN(num)) return false;
        listClick(num);
    });
    
    // 移动端列表项单击播放
    $(".music-list").on("click",".list-item", function() {
        if(rem.isMobile) {
            var num = parseInt($(this).data("no"));
            if(isNaN(num)) return false;
            listClick(num);
        }
    });
    
    // 列表鼠标移过显示对应的操作按钮
    $(".music-list").on("mousemove",".list-item", function() {
        var num = parseInt($(this).data("no"));
        if(isNaN(num)) return false;
        // 还没有追加菜单则加上菜单
        if(!$(this).data("loadmenu")) {
            var target = $(this).find(".music-name");
            var html = '<span class="music-name-cult">' + target.html()+'</span>';
            target.html(html);
            $(this).data("loadmenu", true);
        }
    });
    
    // 列表中的菜单点击
    $(".music-list").on("click",".icon-play,.icon-download,.icon-share", function() {
        var num = parseInt($(this).parent().data("no"));
        if(isNaN(num)) return false;
        switch($(this).data("function")) {
            case "play":    // 播放
                listClick(num);     // 调用列表点击处理函数
            break;
            case "download":    // 下载
                download(musicList[rem.dislist].item[num]);
            break;
        }
        return true;
    });
    
    // 点击加载更多
    $(".music-list").on("click",".list-loadmore", function() {
        $(".list-loadmore").removeClass('list-loadmore');
        $(".list-loadmore").html('加载中...');
        ajaxSearch();
    });
    
    // 播放、暂停按钮的处理
    $(".btn-play").click(function(){
        pause();
    });
    
    // 循环顺序的处理
    $(".btn-order").click(function(){
        orderChange();
    });
    // 上一首歌
    $(".btn-prev").click(function(){
        prevMusic();
    });
    
    // 下一首
    $(".btn-next").click(function(){
        nextMusic();
    });
    
    // 静音按钮点击事件
    $(".btn-quiet").click(function(){
        var oldVol;     // 之前的音量值
        if($(this).is('.btn-state-quiet')) {
            oldVol = $(this).data("volume");
            oldVol = oldVol? oldVol: (rem.isMobile? 1: mkPlayer.volume);  // 没找到记录的音量，则重置为默认音量
            $(this).removeClass("btn-state-quiet");     // 取消静音
        } else {
            oldVol = volume_bar.percent;
            $(this).addClass("btn-state-quiet");        // 开启静音
            $(this).data("volume", oldVol); // 记录当前音量值
            oldVol = 0;
        }
        playerSavedata('volume', oldVol); // 存储音量信息
        volume_bar.goto(oldVol);    // 刷新音量显示
        if(rem.audio[0] !== undefined) rem.audio[0].volume = oldVol;  // 应用音量
    });
    // 初始化播放列表
    initList(); 
});

// 下载正在播放的这首歌
function thisDownload(obj) {
    ajaxUrl(musicList[$(obj).data("list")].item[$(obj).data("index")], download);
}

// 分享正在播放的这首歌
function thisShare(obj) {
    ajaxUrl(musicList[$(obj).data("list")].item[$(obj).data("index")], ajaxShare);
}

// 下载歌曲
function download(music) {
    openDownloadDialog(music.url, music.name + ' - ' + music.artist);
}

/**
 * 通用的打开下载对话框方法，没有测试过具体兼容性
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 * http://www.cnblogs.com/liuxianan/p/js-download.html
 */
function openDownloadDialog(url, saveName)
{
    if(typeof url == 'object' && url instanceof Blob)
    {
        url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.target = "_blank";
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if(window.MouseEvent) event = new MouseEvent('click');
    else
    {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

// 向列表中载入某个播放列表
function loadList(list) {
    if(musicList[list].isloading === true) {
        layer.msg('列表读取中...', {icon: 16,shade: 0.01,time: 500});
        return true;
    }
    rem.dislist = list;     // 记录当前显示的列表
    dataBox("list");    // 在主界面显示出播放列表
    rem.mainList.html('');   // 清空列表中原有的元素
    addListhead();      // 向列表中加入列表头
    
    if(musicList[list].item.length === 0) {
        addListbar("nodata");   // 列表中没有数据
    } else {
        // 逐项添加数据
        for(var i=0; i<musicList[list].item.length; i++) {
            var tmpMusic = musicList[list].item[i];
            addItem(i + 1, tmpMusic.name, tmpMusic.duration);
        }
        // 列表加载完成后的处理
        if(list === 1 || list === 2) {    // 历史记录和正在播放列表允许清空
            addListbar("clear");    // 清空列表
        }
        
        if(rem.playlist === undefined) {    // 未曾播放过
            if(mkPlayer.autoplay === true) pause();  // 设置了自动播放，则自动播放
        } else {
            refreshList();  // 刷新列表，添加正在播放样式
        }
        listToTop();    // 播放列表滚动到顶部
    }
}

// 播放列表滚动到顶部
function listToTop() {
    if(rem.isMobile) {
        $("#main-list").animate({scrollTop: 0}, 200);
    } else {
        $("#main-list").mCustomScrollbar("scrollTo", 0, "top");
    }
}

// 向列表中加入列表头
function addListhead() {
    var html = '<div class="list-item list-head">' +
    '    <span class="music-album">' +
    '        时长' +
    '    </span>' +
    '    <span class="music-name">' +
    '        歌曲' +
    '    </span>' +
    '</div>';
    rem.mainList.append(html);
}

// 列表中新增一项
// 参数：编号、名字、歌手、专辑
function addItem(no, name, album) {
    var html = '<div class="list-item" data-no="' + (no - 1) + '">' +
    '    <span class="list-num">' + no + '</span>' +
    '    <span class="music-album">' + album + '</span>' +
    '    <span class="music-name">' + name + '</span>' +
    '</div>'; 
    rem.mainList.append(html);
}

// 加载列表中的提示条
// 参数：类型（more、nomore、loading、nodata、clear）
function addListbar(types) {
    var html
    switch(types) {
        case "more":    // 还可以加载更多
            html = '<div class="list-item text-center list-loadmore list-clickable" title="点击加载更多数据" id="list-foot">点击加载更多...</div>';
        break;
        
        case "nomore":  // 数据加载完了
            html = '<div class="list-item text-center" id="list-foot">全都加载完了</div>';
        break;
        
        case "loading": // 加载中
            html = '<div class="list-item text-center" id="list-foot">播放列表加载中...</div>';
        break;
        
        case "nodata":  // 列表中没有内容
            html = '<div class="list-item text-center list-clickable" id="list-foot">从文件夹中加载音乐</div>';
        break;
        
        case "clear":   // 清空列表
            html = '<div class="list-item text-center list-clickable" id="list-foot" onclick="clearDislist();">清空列表</div>';
        break;
    }
    rem.mainList.append(html);
}

// 将时间格式化为 00:00 的格式
// 参数：原始时间
function formatTime(time){    
	var hour,minute,second;
	hour = String(parseInt(time/3600,10));
	if(hour.length == 1) hour='0' + hour;
	
	minute=String(parseInt((time%3600)/60,10));
	if(minute.length == 1) minute='0'+minute;
	
	second=String(parseInt(time%60,10));
	if(second.length == 1) second='0'+second;
	
	if(hour > 0) {
	    return hour + ":" + minute + ":" + second;
	} else {
	    return minute + ":" + second;
	}
}

// url编码
// 输入参数：待编码的字符串
function urlEncode(String) {
    return encodeURIComponent(String).replace(/'/g,"%27").replace(/"/g,"%22");	
}

// 在 ajax 获取了音乐的信息后再进行更新
// 参数：要进行更新的音乐
function updateMinfo(music) {
    // 不含有 id 的歌曲无法更新
    if(!music.id) return false;
    
    // 循环查找播放列表并更新信息
    for(var i=0; i<musicList.length; i++) {
        for(var j=0; j<musicList[i].item.length; j++) {
            // ID 对上了，那就更新信息
            if(musicList[i].item[j].id == music.id && musicList[i].item[j].source == music.source) {
                musicList[i].item[j] == music;  // 更新音乐信息
                j = musicList[i].item.length;   // 一个列表中只找一首，找到了就跳出
            }
        }
    }
}

// 刷新当前显示的列表，如果有正在播放则添加样式
function refreshList() {
    // 还没播放过，不用对比了
    if(rem.playlist === undefined) return true;
    
    $(".list-playing").removeClass("list-playing");        // 移除其它的正在播放
    
    if(rem.paused !== true) {   // 没有暂停
        for(var i=0; i<musicList[rem.dislist].item.length; i++) {
            // 与正在播放的歌曲 id 相同
            if((musicList[rem.dislist].item[i].id !== undefined) && 
              (musicList[rem.dislist].item[i].id == musicList[1].item[rem.playid].id) && 
              (musicList[rem.dislist].item[i].source == musicList[1].item[rem.playid].source)) {
                $(".list-item[data-no='" + i + "']").addClass("list-playing");  // 添加正在播放样式
                
                return true;    // 一般列表中只有一首，找到了赶紧跳出
            }
        }
    }
    
}
// 添加一个歌单
// 参数：编号、歌单名字、歌单封面      '    <img class="sheet-cover" src="' +name+ '">' +
function addSheet(no, name) {
    if(!name) name = "读取中...";
    var html = '<div class="sheet-item" data-no="' + no + '">' +
    '    <p class="sheet-name">' +name+ '</p>' +
    '</div>'; 
    rem.mainList.append(html);
}
// 清空歌单显示
function clearSheet() {
    rem.sheetList.html('');
}

// 选择要显示哪个数据区
// 参数：要显示的数据区（list、sheet、player）
function dataBox(choose) {
    $('.btn-box .active').removeClass('active');
    switch(choose) {
        case "list":    // 显示播放列表
            if ($("#player").css('display') === 'none') {
                $("#player").fadeIn();
            }
            $("#main-list").fadeIn();
            $("#history").fadeOut();
            if(rem.dislist === 1 || rem.dislist === rem.playlist) {  // 正在播放
                $(".btn[data-action='playing']").addClass('active');
            }
        break;
        
        case "history":   // 显示专辑
            if ($("#player").css('display') === 'none') {
                $("#player").fadeIn();
            }
            $("#history").fadeIn();
            $("#main-list").fadeOut();
            $(".btn[data-action='history']").addClass('active');
        break;
    }
}

// 初始化播放列表
function initList() {
    // 显示所有的歌单
    for(var i=1; i<musicList.length; i++) {
        if(i === 1 && file_id) {    // 正在播放列表, 读取正在播放列表
            $.ajax({
                type: 'GET',
                async: false,
                url: servers + '/music/info/get/' + file_id,
                success: function (data){
                    if (data['code'] === 0) {
                        musicList[1].item = [{
                            id: data['data']['id'],
                            name: data['data']['name'],
                            duration: data['data']['duration'],
                            url: servers + '/file/download/' + data['data']['id'],
                            lyric_url: servers + '/music/lyric/get/' + data['data']['id']
                        }];
                        mkPlayer.defaultlist = 1;
                        window.parent.$.Toast(data['msg'], 'success');
                    } else {
                        window.parent.$.Toast(data['msg'], 'error');
                        return;
                    }
                }
            })
        } else if(i === 2) { // 历史记录列表
            $.ajax({
                type: 'GET',
                async: false,
                url: servers + '/music/history/get',
                success: function (data){
                    if (data['code'] === 0) {
                        for (let nn=0; nn<data['data'].length; nn++) {
                            musicList[2].item.add({
                                id: data['data']['id'],
                                name: data['data']['name'],
                                duration: data['data']['duration'],
                                url: servers + '/file/download/' + data['data']['id'],
                                lyric_url: servers + '/music/lyric/get/' + data['data']['id']
                            });
                        }
                        window.parent.$.Toast(data['msg'], 'success');
                    } else {
                        window.parent.$.Toast(data['msg'], 'error');
                        return;
                    }
                }
            })
        }
        // 在前端显示出来
        addSheet(i, musicList[i].name);
    }
    
    // 首页显示默认列表
    if(mkPlayer.defaultlist >= musicList.length) mkPlayer.defaultlist = 1;  // 超出范围，显示正在播放列表
    if(musicList[mkPlayer.defaultlist].isloading !== true)  loadList(mkPlayer.defaultlist);
}

// 清空当前显示的列表
function clearDislist() {
    musicList[rem.dislist].item.length = 0;  // 清空内容
    if(rem.dislist === 1) {  // 正在播放列表
        playerSavedata('playing', '');  // 清空本地记录
    } else if(rem.dislist === 2) {   // 播放记录
        playerSavedata('his', '');  // 清空本地记录
    }
    layer.msg('列表已被清空');
    dataBox("sheet");    // 在主界面显示出音乐专辑
}

// 刷新播放列表，为正在播放的项添加正在播放中的标识
function refreshSheet() {
    // 调试信息输出
    if(mkPlayer.debug) {
        console.log("开始播放列表 " + musicList[rem.playlist].name + " 中的歌曲");
    }
    
    $(".sheet-playing").removeClass("sheet-playing");        // 移除其它的正在播放
    
    $(".sheet-item[data-no='" + rem.playlist + "']").addClass("sheet-playing"); // 添加样式
}

// 播放器本地存储信息
// 参数：键值、数据
function playerSavedata(key, data) {
    key = 'mkPlayer2_' + key;    // 添加前缀，防止串用
    data = JSON.stringify(data);
    // 存储，IE6~7 不支持HTML5本地存储
    if (window.localStorage) {
        localStorage.setItem(key, data);	
    }
}

// 播放器读取本地存储信息
// 参数：键值
// 返回：数据
function playerReaddata(key) {
    if(!window.localStorage) return '';
    key = 'mkPlayer2_' + key;
    return JSON.parse(localStorage.getItem(key));
}
