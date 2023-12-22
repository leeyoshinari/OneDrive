// 完善获取音乐信息
// 音乐所在列表ID、音乐对应ID、回调函数
function ajaxUrl(music, callback)
{
    // 已经有数据，直接回调
    if(music.url !== null && music.url !== "err" && music.url !== "") {
        callback(music);
        return true;
    }
    // id为空，赋值链接错误。直接回调
    if(music.id === null) {
        music.url = "err";
        updateMinfo(music); // 更新音乐信息
        callback(music);
        return true;
    }
    
    $.ajax({ 
        type: mkPlayer.method, 
        url: mkPlayer.api,
        data: "types=url&id=" + music.id + "&source=" + music.source,
        dataType : "jsonp",
        success: function(jsonData){
            // 调试信息输出
            if(mkPlayer.debug) {
                console.debug("歌曲链接：" + jsonData.url);
            }
            
            // 解决网易云音乐部分歌曲无法播放问题
            if(music.source == "netease") {
                if(jsonData.url === "") {
                    jsonData.url = "https://music.163.com/song/media/outer/url?id=" + music.id + ".mp3";
                } else {
                    jsonData.url = jsonData.url.replace(/m7c.music./g, "m7.music.");
                    jsonData.url = jsonData.url.replace(/m8c.music./g, "m8.music.");
                }
            } else if(music.source == "baidu") {    // 解决百度音乐防盗链
                jsonData.url = jsonData.url.replace(/http:\/\/zhangmenshiting.qianqian.com/g, "https://gss0.bdstatic.com/y0s1hSulBw92lNKgpU_Z2jR7b2w6buu");
            }
            
            if(jsonData.url === "") {
                music.url = "err";
            } else {
                music.url = jsonData.url;    // 记录结果
            }
            
            updateMinfo(music); // 更新音乐信息
            
            callback(music);    // 回调函数
            return true;
        },   //success
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('歌曲链接获取失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
        }   // error 
    }); //ajax
    
}

// ajax加载歌词
// 参数：音乐ID，回调函数
function ajaxLyric(music, callback) {
    lyricTip('歌词加载中...');
    $.ajax({
        type: 'GET',
        url: music.lyric_url,
        success: function(data){
            if (data['code'] === 0) {
                callback(data['data'], music.lyric_url);
            } else {
                callback('', music.lyric_url);
            }
        },   //success
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            layer.msg('歌词读取失败 - ' + XMLHttpRequest.status);
            console.error(XMLHttpRequest + textStatus + errorThrown);
            callback('', music.lyric_url);
        }
    });
}
