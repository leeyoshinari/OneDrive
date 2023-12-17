const default_icon = 'img/files/none.png';
const icons = {
    'video': 'img/files/video.png', 'picture': 'img/files/picture.png', 'markdown': 'img/files/markdown.png',
    'jpg': 'img/files/picture.png', 'jpeg': 'img/files/picture.png', 'gif': 'img/files/picture.png',
    'png': 'img/files/picture.png', 'bmp': 'img/files/picture.png',
    'mp4': 'img/files/video.png', 'avi': 'img/files/video.png', 'xmind': 'img/files/xmind.ico',
    'exe': 'img/files/exefile.png', 'txt': 'img/files/txt.png', 'sheet': 'img/files/excel.png',
    'doc': 'img/files/word.png', 'docx': 'img/files/word.png', 'docu': 'img/files/word.png',
    'xls': 'img/files/excel.png', 'xlsx': 'img/files/excel.png',
    'ppt': 'img/files/ppt.png', 'pptx': 'img/files/ppt.png', 'zip': 'img/files/zip.png',
    'mp3': 'img/files/music.png', 'pdf': 'img/files/pdf.png', 'json': 'img/files/json.png',
    'py': 'img/python.svg', 'md': 'img/files/markdown.png', 'html': 'img/files/html.png',
    'pythonEditor':'img/python.svg'
};

document.querySelectorAll(`list.focs`).forEach(li => {
    li.addEventListener('click', e => {
        let _ = li.querySelector('span.focs'), la = li.querySelector('a.check'),
            las = li.querySelectorAll('a');
        $(_).addClass('cl');
        $(_).css('img/explorer/rb.png', la.offsetTop - las[las.length - 1].offsetTop);
        $(_).css('left', la.offsetLeft - li.offsetLeft);
        setTimeout(() => {
            $(_).removeClass('cl');
        }, 500);
    })
});
// 禁止拖拽图片
$('img').on('dragstart', () => {
    return false;
});
// 右键菜单
$('html').on('contextmenu', () => {
    return false;
});
function stop(e) {
    e.stopPropagation();
    return false;
}
$('input,textarea,*[contenteditable=true]').on('contextmenu', (e) => {
    stop(e);
    return true;
});
let nomax = { 'calc': 0 /* 其实，计算器是可以最大化的...*/};
let nomin = {};
let topmost = [];
let startClientX = 0;
let startClientY = 0;
let endClientX = 0;
let endClientY = 0;
let cms = {
    'titbar': [
        function (arg) {
            if (arg in nomax) {
                return 'null';
            }
            if ($('.window.' + arg).hasClass("max")) {
                return ['<i class="bi bi-window-stack"></i> '+i18next.t('restore'), `maxwin('${arg}')`];
            }
            else {
                return ['<i class="bi bi-window-fullscreen"></i> '+i18next.t('max.window'), `maxwin('${arg}')`];
            }
        },
        function (arg) {
            if (arg in nomin) {
                return 'null';
            }
            else {
                return ['<i class="bi bi-window-dash"></i> '+i18next.t('min.window'), `minwin('${arg}')`];
            }
        },
        function (arg) {
            if (arg in nomin) {
                return ['<i class="bi bi-window-x"></i> '+i18next.t('close'), `hidewin('${arg}', 'configs')`];
            }
            else {
                return ['<i class="bi bi-window-x"></i> '+i18next.t('close'), `hidewin('${arg}')`];
            }
        },
    ],
    'taskbar': [
        function (arg) {
            return ['<i class="bi bi-window-x"></i> '+i18next.t('close'), `hidewin('${arg}')`];
        }
    ],
    'desktop': [
        ['<i class="bi bi-arrow-clockwise"></i> '+i18next.t('refresh'), `$('#desktop').css('opacity','0');setTimeout(()=>{$('#desktop').css('opacity','1');},100);`],
        ],
    'desktop.icon': [
        function (arg) {
            return ['<i class="bi bi-folder2-open"></i> 打开', 'openapp(`' + arg[0] + '`)']
        }
    ],
    'explorer.folder': [
        arg => {
            return ['<i class="bi bi-arrow-up-right-square"></i> '+i18next.t('tab.open'), `apps.explorer.newtab('${arg}');`];
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-trash3"></i> '+i18next.t('setting.window.shell.server.list.action.delete'), `apps.explorer.del('${arg}')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-input-cursor-text"></i> '+i18next.t('explore.window.file.tool.rename.title'), `apps.explorer.rename('${arg}')`];
            return 'null';
        }
    ],
    'explorer.file': [
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-trash3"></i> '+i18next.t('setting.window.shell.server.list.action.delete'), `apps.explorer.del('${arg}')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-input-cursor-text"></i> '+i18next.t('explore.window.file.tool.rename.title'), `apps.explorer.rename('${arg}')`];
            return 'null';
        }
    ],
    'explorer.content': [
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-file-earmark-plus"></i> '+i18next.t('explore.window.file.tool.file.title'), `apps.explorer.add($('#win-explorer>.path>.tit')[0].id,type='file')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-folder-plus"></i> '+i18next.t('explore.window.file.tool.folder.title'), `apps.explorer.add($('#win-explorer>.path>.tit')[0].id,type='folder')`];
            return 'null';
        },
        arg => {
            if ($('#win-explorer>.path>.tit>.path>div.text').length > 1)
                return ['<i class="bi bi-arrow-clockwise"></i> '+i18next.t('refresh'), `apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id)`];
            return ['<i class="bi bi-arrow-clockwise"></i> '+i18next.t('refresh'), `apps.explorer.reset()`];
        }
    ],
    'explorer.tab': [
        arg => {
            return ['<i class="bi bi-x"></i> '+i18next.t('tab.close'), `m_tab.close('explorer',${arg})`];
        }
    ],
    'edge.tab': [
        arg => {
            return ['<i class="bi bi-pencil-square"></i> '+i18next.t('tab.rename'), `apps.edge.c_rename(${arg})`];
        },
        arg => {
            return ['<i class="bi bi-x"></i> '+i18next.t('tab.close'), `m_tab.close('edge',${arg})`];
        }
    ],
}
window.onkeydown = function (event) {
    if (event.keyCode === 116/*F5被按下(刷新)*/) {
        event.preventDefault();/*取消默认刷新行为*/
        $('#desktop').css('opacity', '0'); setTimeout(() => { $('#desktop').css('opacity', '1'); }, 10);
    }
}

function showcm(e, cl, arg) {
    if ($('#cm').hasClass('show-begin')) {
        setTimeout(() => {
            $('#cm').css('left', e.clientX);
            $('#cm').css('top', e.clientY);
            let h = '';
            cms[cl].forEach(item => {
                if (typeof (item) == 'function') {
                    arg.event = e;
                    ret = item(arg);
                    if (ret === 'null') return true;
                    h += `<a class="a" onmousedown="${ret[1]}">${ret[0]}</a>\n`;
                }
                else if (typeof (item) == 'string') {
                    h += item + '\n';
                }
                else {
                    h += `<a class="a" onmousedown="${item[1]}">${item[0]}</a>\n`;
                }
            })
            $('#cm>list')[0].innerHTML = h;
            $('#cm').addClass('show-begin');
            $('#cm>.foc').focus();
            // 这个.foc是用来模拟焦点的，这句是将焦点放在右键菜单上，注释掉后果不堪设想
            // 噢 可是如果设置焦点的话在移动设备上会显示虚拟键盘啊
            setTimeout(() => {
                $('#cm').addClass('show');
            }, 0);
            setTimeout(() => {
                if (e.clientY + $('#cm')[0].offsetHeight > $('html')[0].offsetHeight) {
                    $('#cm').css('top', e.clientY - $('#cm')[0].offsetHeight);
                }
                if (e.clientX + $('#cm')[0].offsetWidth > $('html')[0].offsetWidth) {
                    $('#cm').css('left', $('html')[0].offsetWidth - $('#cm')[0].offsetWidth - 5);
                }
            }, 200);
        }, 200);
        return;
    }
    $('#cm').css('left', e.clientX);
    $('#cm').css('top', e.clientY);
    let h = '';
    cms[cl].forEach(item => {
        if (typeof (item) == 'function') {
            ret = item(arg);
            if (ret === 'null') {
                return true;
            }
            h += `<a class="a" onmousedown="${ret[1]}">${ret[0]}</a>\n`;
        } else if (typeof (item) == 'string') {
            h += item + '\n';
        } else {
            h += `<a class="a" onmousedown="${item[1]}">${item[0]}</a>\n`;
        }
    })
    $('#cm>list')[0].innerHTML = h;
    $('#cm').addClass('show-begin');
    $('#cm>.foc').focus();
    setTimeout(() => {
        $('#cm').addClass('show');
    }, 0);
    setTimeout(() => {
        if (e.clientY + $('#cm')[0].offsetHeight > $('html')[0].offsetHeight) {
            $('#cm').css('top', e.clientY - $('#cm')[0].offsetHeight);
        }
        if (e.clientX + $('#cm')[0].offsetWidth > $('html')[0].offsetWidth) {
            $('#cm').css('left', $('html')[0].offsetWidth - $('#cm')[0].offsetWidth - 5);
        }
    }, 200);
}
$('#cm>.foc').blur(() => {
    let x = event.target.parentNode;
    $(x).removeClass('show');
    setTimeout(() => {
        $(x).removeClass('show-begin');
    }, 200);
});

let dps = {}
let dpt = null, isOnDp = false;
$('#dp')[0].onmouseover = () => { isOnDp = true };
$('#dp')[0].onmouseleave = () => { isOnDp = false; hidedp() };
function showdp(e, cl, arg) {
    if ($('#dp').hasClass('show-begin')) {
        $('#dp').removeClass('show');
        setTimeout(() => {
            $('#dp').removeClass('show-begin');
        }, 200);
        if (e !== dpt) {
            setTimeout(() => {
                showdp(e, cl, arg);
            }, 400);
        }
        return;
    }
    // dpt = e;
    let off = $(e).offset();
    $('#dp').css('left', off.left);
    $('#dp').css('top', off.top + e.offsetHeight);
    let h = '';
    dps[cl].forEach(item => {
        if (typeof (item) == 'function') {
            ret = item(arg);
            if (ret === 'null') {
                return true;
            }
            h += `<a class="a" onclick="${ret[1]}">${ret[0]}</a>\n`;
        } else if (typeof (item) == 'string') {
            h += item + '\n';
        } else {
            h += `<a class="a" onclick="${item[1]}">${item[0]}</a>\n`;
        }
    })
    $('#dp>list')[0].innerHTML = h;
    $('#dp').addClass('show-begin');
    setTimeout(() => {
        $('#dp').addClass('show');
    }, 0);
    setTimeout(() => {
        if (off.top + e.offsetHeight + $('#dp')[0].offsetHeight > $('html')[0].offsetHeight) {
            $('#dp').css('top', off.top - $('#dp')[0].offsetHeight);
        }
        if (off.left + $('#dp')[0].offsetWidth > $('html')[0].offsetWidth) {
            $('#dp').css('left', $('html')[0].offsetWidth - $('#dp')[0].offsetWidth - 5);
        }
    }, 200);
}
function hidedp(force = false) {
    setTimeout(() => {
        if (isOnDp && !force) {
            return;
        }
        $('#dp').removeClass('show');
        setTimeout(() => {
            $('#dp').removeClass('show-begin');
        }, 200);
    }, 100);
}

// 悬停提示
document.querySelectorAll('*[win12_title]:not(.notip)').forEach(a => {
    a.addEventListener('mouseenter', showdescp);
    a.addEventListener('mouseleave', hidedescp);
})
function showdescp(e) {
    $(e.target).attr('data-descp', 'waiting');
    setTimeout(() => {
        if ($(e.target).attr('data-descp') === 'hide') {
            return;
        }
        $(e.target).attr('data-descp', 'show');
        $('#descp').css('left', e.clientX + 1);
        $('#descp').css('top', e.clientY + 2);
        $('#descp').text($(e.target).attr('win12_title'));
        $('#descp').addClass('show-begin');
        setTimeout(() => {
            if (e.clientY + $('#descp')[0].offsetHeight + 20 >= $('html')[0].offsetHeight) {
                $('#descp').css('top', e.clientY - $('#descp')[0].offsetHeight - 10);
            }
            if (e.clientX + $('#descp')[0].offsetWidth + 15 >= $('html')[0].offsetWidth) {
                $('#descp').css('left', e.clientX - $('#descp')[0].offsetWidth - 10);
            }
            $('#descp').addClass('show');
        }, 100);
    }, 500);
}
function hidedescp(e) {
    $('#descp').removeClass('show');
    $(e.target).attr('data-descp', 'hide');
    setTimeout(() => {
        $('#descp').removeClass('show-begin');
    }, 100);
}

// 提示
let nts = {
    'ZeroDivision': {//计算器报错窗口
        cnt: `<p class="tit">错误</p>
            <p>除数不得等于0</p>`,
        btn: [
            { type: 'main', text: i18next.t('submit'), js: 'closenotice();' },
        ]
    },
    'share': {
        cnt: `<p class="tit"></p><input type="text" id="share-time" placeholder="" style="width: 95%;">`,
        btn: [
            { type: 'main', text: i18next.t('submit'), js: 'apps.explorer.share();' },
            { type: 'detail', text: i18next.t('cancel'), js: 'closenotice();' }
        ]
    },
    'uploadResult': {
        cnt: `<p class="tit"></p><list class="upload-result"></list>`,
        btn: [
            { type: 'main', text: i18next.t('submit'), js: 'closenotice();' }]
    }
}
function shownotice(name) {
    $('#notice>.cnt').html(nts[name].cnt);
    let tmp = '';
    nts[name].btn.forEach(btn => {
        tmp += `<a class="a btn ${btn.type}" onclick="${btn.js}">${btn.text}</a>`
    });
    $('#notice>.btns').html(tmp);
    if (name === 'share') {
        $('#notice>.cnt>p')[0].style.width = '500px';
        $('#notice>.cnt>p')[0].innerText = i18next.t('explore.window.file.tool.share.window.title');
        $('#notice>.cnt>input')[0].placeholder = i18next.t('explore.window.file.tool.share.window.placeholder');
    }
    if (name === 'uploadResult') {
        $('#notice>.cnt>p')[0].innerText = i18next.t('terminal.page.upload.result.tips');
    }
    setTimeout(() => {
        $('#notice-back').addClass('show');
    }, 20);
}
function closenotice() {
    $('#notice')[0].style.width = '';
    $('#notice')[0].style.height = '';
    $('#notice>.cnt').html('');
    $('#notice>.btns').html('');
    $('#notice-back').removeClass('show');
}
// 应用
let apps = {
    setting: {
        init: () => {
            if ($('.window.setting>link').length < 1) {
                let css_link = document.createElement('link');
                css_link.setAttribute('rel', 'stylesheet');
                css_link.setAttribute('href', 'css/setting.css');
                $('.window.setting')[0].appendChild(css_link);
            }
            $('#win-setting>.menu>list>a.user')[0].click();
        },
        page: (name) => {
            $('#win-setting>.page>.cnt.' + name).scrollTop(0);
            $('#win-setting>.page>.cnt.show').removeClass('show');
            $('#win-setting>.page>.cnt.' + name).addClass('show');
            $('#win-setting>.menu>list>a.check').removeClass('check');
            $('#win-setting>.menu>list>a.' + name).addClass('check');
            if (name === 'user') {
                $('#win-setting>.page>.cnt.user>div>a>div>p')[0].innerText = document.cookie.split('u=')[1].split(';')[0];
            }
        },
    },
    whiteboard: {
        canvas: null,
        ctx: null,
        windowResizeObserver: null,
        color: 'red',
        init: () => {
            if ($('.window.whiteboard>link').length < 1) {
                let css_link = document.createElement('link');
                css_link.setAttribute('rel', 'stylesheet');
                css_link.setAttribute('href', 'css/whiteboard.css');
                $('.window.whiteboard')[0].appendChild(css_link);
            }
            apps.whiteboard.ctx.lineJoin = 'round';
            apps.whiteboard.ctx.lineCap = 'round';
            apps.whiteboard.changeColor(apps.whiteboard.color);
            if ($(':root').hasClass('dark')) {
                $('.window.whiteboard>.titbar>span>.title').text('Blackboard');
            } else {
                $('.window.whiteboard>.titbar>span>.title').text('Whiteboard');
            }
        },
        changeColor: (color) => {
            apps.whiteboard.color = color;
            if (color === 'eraser') {
                apps.whiteboard.ctx.strokeStyle = 'black';
                apps.whiteboard.ctx.lineWidth = 35;
                apps.whiteboard.ctx.globalCompositeOperation = 'destination-out';
            }
            else {
                apps.whiteboard.ctx.strokeStyle = color;
                apps.whiteboard.ctx.globalCompositeOperation = 'source-over';
                apps.whiteboard.ctx.lineWidth = 8;
            }
        },
        changePen: function () {
            const pens = $('#win-whiteboard>.toolbar>.tools>*');
            for (const elt of pens) {
                elt.classList.remove('active');
            }
            this.classList.add('active');
            apps.whiteboard.changeColor(this.dataset.color);
        },
        load: () => {
            apps.whiteboard.canvas = $('#win-whiteboard>canvas')[0];
            apps.whiteboard.ctx = apps.whiteboard.canvas.getContext('2d');
            apps.whiteboard.windowResizeObserver = new ResizeObserver(apps.whiteboard.resize);
            apps.whiteboard.windowResizeObserver.observe($('.window.whiteboard')[0], { box: 'border-box' });
        },
        resize: () => {
            try {
                const imgData = apps.whiteboard.ctx.getImageData(0, 0, apps.whiteboard.canvas.width, apps.whiteboard.canvas.height);
                apps.whiteboard.canvas.width = $('#win-whiteboard')[0].clientWidth;
                apps.whiteboard.canvas.height = $('#win-whiteboard')[0].clientHeight;
                apps.whiteboard.ctx.putImageData(imgData, 0, 0);
            }
            catch {
                apps.whiteboard.canvas.width = $('#win-whiteboard')[0].clientWidth;
                apps.whiteboard.canvas.height = $('#win-whiteboard')[0].clientHeight;
            }
            apps.whiteboard.init();
        },
        draw: (e) => {
            let offsetX, offsetY, left = $('#win-whiteboard')[0].getBoundingClientRect().left, top = $('#win-whiteboard')[0].getBoundingClientRect().top;
            if (e.type.match('mouse')) {
                offsetX = e.clientX - left, offsetY = e.clientY - top;
            }
            else if (e.type.match('touch')) {
                offsetX = e.touches[0].clientX - left, offsetY = e.touches[0].clientY - top;
            }
            apps.whiteboard.ctx.beginPath();
            apps.whiteboard.ctx.moveTo(offsetX, offsetY);
            page.onmousemove = apps.whiteboard.drawing;
            page.ontouchmove = apps.whiteboard.drawing;
            page.onmouseup = apps.whiteboard.up;
            page.ontouchend = apps.whiteboard.up;
            page.ontouchcancel = apps.whiteboard.up;
        },
        drawing: (e) => {
            let offsetX, offsetY, left = $('#win-whiteboard')[0].getBoundingClientRect().left, top = $('#win-whiteboard')[0].getBoundingClientRect().top;
            if (e.type.match('mouse')) {
                offsetX = e.clientX - left, offsetY = e.clientY - top;
            }
            else if (e.type.match('touch')) {
                offsetX = e.touches[0].clientX - left, offsetY = e.touches[0].clientY - top;
            }
            apps.whiteboard.ctx.lineTo(offsetX, offsetY);
            apps.whiteboard.ctx.stroke();
        },
        up: () => {
            apps.whiteboard.ctx.stroke();
            page.onmousemove = null;
            page.ontouchmove = null;
            page.onmouseup = null;
            page.ontouchend = null;
            page.ontouchcancel = null;
        },
        download: () => {
            const url = apps.whiteboard.canvas.toDataURL();
            $('#win-whiteboard>a.download')[0].href = url;
            $('#win-whiteboard>a.download')[0].click();
        },
        delete: () => {
            apps.whiteboard.ctx.clearRect(0, 0, apps.whiteboard.canvas.width, apps.whiteboard.canvas.height);
        }
    },
    explorer: {
        init: () => {
            apps.explorer.tabs = [];
            apps.explorer.len = 0;
            apps.explorer.newtab();
            // apps.explorer.reset();
            apps.explorer.is_use = 0;//千万不要删除它，它依托bug运行
            apps.explorer.is_use2 = 0;//千万不要删除它，它依托bug运行
            apps.explorer.clipboard = null;
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Delete' && $('.window.foc')[0].classList[1] === "explorer") {
                    apps.explorer.del();
                }
            });
        },
        tabs: [],
        now: null,
        len: 0,
        newtab: (path = '', path_id = '') => {
            m_tab.newtab('explorer', '');
            apps.explorer.tabs[apps.explorer.tabs.length - 1][2] = path;
            apps.explorer.tabs[apps.explorer.tabs.length - 1][3] = path_id;
            apps.explorer.initHistory(apps.explorer.tabs[apps.explorer.tabs.length - 1][0]);
            apps.explorer.checkHistory(apps.explorer.tabs[apps.explorer.tabs.length - 1][0]);
            m_tab.tab('explorer', apps.explorer.tabs.length - 1);
        },
        settab: (t, i) => {
            return `<div class="tab ${t[0]}" onclick="m_tab.tab('explorer',${i})" oncontextmenu="showcm(event,'explorer.tab',${i});stop(event);return false" onmousedown="m_tab.moving('explorer',this,event,${i});stop(event);" ontouchstart="m_tab.moving('exploer',this,event,${i});stop(event);"><p>${t[1]}</p><span class="clbtn bi bi-x" onclick="m_tab.close('explorer',${i});stop(event);"></span></div>`;
        },
        tab: (c, load = true) => {
            if (load) {
                if (!apps.explorer.tabs[c][2].length) apps.explorer.reset();
                else apps.explorer.goto(apps.explorer.tabs[c][2], apps.explorer.tabs[c][3]);
            }
            apps.explorer.checkHistory(apps.explorer.tabs[c][0]);
        },
        reset: (clear = true) => {
            $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = `<style>#win-explorer>.page>.main>.content>.view>.class{margin: 5px 0 0 10px;display: flex;}
            #win-explorer>.page>.main>.content>.view>.class>img{width: 20px;height: 20px;margin-top: 3px;margin-right: 5px;filter:brightness(0.9);}
            #win-explorer>.page>.main>.content>.view>.group{display: flex;flex-wrap: wrap;padding: 10px 20px;}
            #win-explorer>.page>.main>.content>.view>.group>.item{width: 280px;margin: 5px;height:80px;
                box-shadow: 0 1px 2px var(--s3d); background: radial-gradient(circle, var(--card),var(--card));border-radius: 10px;display: flex;}
            #win-explorer>.page>.main>.content>.view>.group>.item:hover{background-color: var(--hover);}
            #win-explorer>.page>.main>.content>.view>.group>.item:active{transform: scale(0.97);}
            #win-explorer>.page>.main>.content>.view>.group>.item>img{width:55px;height:55px;margin-top:18px;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div{flex-grow: 1;padding: 5px 5px 0 0;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div>.bar{width: calc(100% - 10px);height: 8px;border-radius: 10px;
                background-color: var(--hover-b);margin: 5px 5px;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div>.bar>.content{height: 100%;background-image: linear-gradient(90deg, var(--theme-1), var(--theme-2));
                border-radius: 10px;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div>.name{margin-left:5px;}
            #win-explorer>.page>.main>.content>.view>.group>.item>div>.info{color:#959595;font-size:14px;margin-left:5px;}</style>
            <p class="class"><img src="img/explorer/disk.svg" alt=""> ${i18next.t('explore.window.file.disk.title')} </p><div class="group"></div>`;
            $('#win-explorer>.page>.menu>.card>list>a')[0].className ='check';
            $('#win-explorer>.page>.menu>.card>list>a')[0].querySelector('span').style.display='flex';
            $('#win-explorer>.page>.menu>.card>list>a')[1].className = '';
            $('#win-explorer>.page>.menu>.card>list>a')[1].querySelector('span').style.display='none';
            $('#win-explorer>.page>.menu>.card>list>a')[2].className = '';
            $('#win-explorer>.page>.menu>.card>list>a')[2].querySelector('span').style.display='none';
            $('#win-explorer>.page>.main')[0].style.display = 'flex';
            $('#win-explorer>.page>.main-share')[0].style.display = 'none';
            $('#win-explorer>.page>.main>.content>.header')[0].style.display = 'none';
            $('#win-explorer>.path>.search')[0].style.display = 'flex';
            $('#win-explorer>.path>.search>input')[0].value = '';
            $('#win-explorer>.path>.back')[0].classList.remove('disabled');
            $('#win-explorer>.path>.back').attr('onclick', 'apps.explorer.reset()');
            $('#win-explorer>.path>.tit')[0].innerHTML = '<div class="icon" style="background-image: url(\'img/explorer/thispc.svg\')"></div><div class="path"><div class="text" onclick="apps.explorer.reset()">' + i18next.t('computer') +'</div><div class="arrow">&gt;</div></div>';
            m_tab.rename('explorer', '<img src="img/explorer/thispc.svg" alt=""> ' + i18next.t('computer'));
            apps.explorer.tabs[apps.explorer.now][2] = '';
            apps.explorer.tabs[apps.explorer.now][3] = '';
            document.getElementById("all_files").checked = false;
            document.querySelector('#win-explorer>.page>.main>.tool').style.display = 'none'
            if (clear) {
                apps.explorer.delHistory(apps.explorer.tabs[apps.explorer.now][0]);
                apps.explorer.pushHistory(apps.explorer.tabs[apps.explorer.now][0], i18next.t('computer'));
            }
            let disk_group = '<a class="a item act" ondblclick="" oncontextmenu=""><img src="img/explorer/diskwin.svg" alt=""><div><p class="name">' + i18next.t('explore.window.file.disk.name') + ' (C:)</p><div class="bar"><div class="content" style="width: 1%;"></div></div><p class="info">520 MB' + i18next.t('explore.window.file.disk.size') + '521 MB</p></div></a>';
            $.get(server + '/disk/get').then(res => {
                res.data.forEach(c => {
                    disk_group = disk_group + '<a class="a item act" ondblclick="apps.explorer.goto(\'' + c['disk'] + ':\'' + ',\'' + c['disk'] + '\')" ontouchend="apps.explorer.goto(\'' + c['disk'] + ':\'' + ',\'' + c['disk'] + '\')" oncontextmenu="showcm(event,\'explorer.folder\',\'' + c['disk'] + ':\');return stop(event);"><img src="img/explorer/disk.svg"><div><p class="name">' + i18next.t('explore.window.file.disk.name') + ' (' + c['disk'] + ':)</p><div class="bar"><div class="content" style="width: ' + c['used'] + '%;"></div></div><p class="info">' + c['free'] + i18next.t('explore.window.file.disk.size') + c['total'] + '</p></div></a>';
                });
                document.getElementsByClassName('group')[0].innerHTML = disk_group;
            });
        },
        garbage: () => {
            $('#win-explorer>.page>.main')[0].style.display = 'flex';
            $('#win-explorer>.page>.main-share')[0].style.display = 'none';
            $('#win-explorer>.page>.menu>.card>list>a')[0].className ='';
            $('#win-explorer>.page>.menu>.card>list>a')[0].querySelector('span').style.display='none';
            $('#win-explorer>.page>.menu>.card>list>a')[1].className = 'check';
            $('#win-explorer>.page>.menu>.card>list>a')[1].querySelector('span').style.display='flex';
            $('#win-explorer>.page>.menu>.card>list>a')[2].className ='';
            $('#win-explorer>.page>.menu>.card>list>a')[2].querySelector('span').style.display='none';
            $('#win-explorer>.path>.search')[0].style.display = 'none';
            $('#win-explorer>.path>.search>input')[0].value = '';
            $('#win-explorer>.path>.back')[0].classList.add('disabled');
            m_tab.rename('explorer', '<img src="img/explorer/rb.png" alt=""> '+i18next.t('explore.window.menu.garbage.title'));
            document.getElementById("all_files").checked = false;
            let sort_field = 'update_time';
            let sort_type = 'desc';
            document.querySelectorAll('#win-explorer>.page>.main>.content>.header>.row>span>button').forEach(item => {
                if (item.className) {
                    sort_field = item.id.split('-')[0];
                    sort_type = item.className;
                }
            })
            document.querySelector('#win-explorer>.page>.main>.tool').style.display = 'flex';
            document.querySelectorAll('#win-explorer>.page>.main>.tool>.asd').forEach(item => {
                item.style.display='none';
            })
            document.querySelectorAll('#win-explorer>.page>.main>.tool>.dsa').forEach(item => {
                item.style.display='flex';
            })
            let tmp = queryAllFiles("garbage", "", sort_field, sort_type);
            if (tmp.length === 0) {
                $('#win-explorer>.page>.main>.content>.header')[0].style.display = 'none';
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '<p class="info">'+i18next.t('explore.window.file.list.empty.tips')+'</p>';
            } else {
                let ht = '';
                $('#win-explorer>.page>.main>.content>.header')[0].style.display = 'flex';
                for(let i=0; i<tmp.length; i++) {
                    if(tmp[i]['folder_type'] === 'folder') {
                        ht += `<div class="row" style="padding-left: 5px;"><input type="checkbox" id="check${tmp[i]['id']}" style="float: left; margin-top: 8px;margin-right: 8px;"><a class="a item files" id="f${tmp[i]['id']}" onclick="apps.explorer.select('${tmp[i]['id']}');" ondblclick="apps.explorer.goto('${tmp[i]['name']}', '${tmp[i]['id']}')">
                            <span style="width: 40%;"><img style="float: left;" src="img/explorer/folder.svg" alt=""><p>${tmp[i]['name']}</p></span><span style="width: 10%;">${i18next.t('explore.window.file.list.folder.type.name')}</span>
                            <span style="width: 10%;"></span><span style="width: 20%;">${tmp[i]['update_time']}</span><span style="width: 20%;">${tmp[i]['create_time']}</span></a></div>`;
                    } else {
                        let f_src = icons[tmp[i]['format']] || default_icon;
                        ht += `<div class="row" style="padding-left: 5px;"><input type="checkbox" id="check${tmp[i]['id']}" style="float: left; margin-top: 8px;margin-right: 8px;"><a class="a item act file" id="f${tmp[i]['id']}" onclick="apps.explorer.select('${tmp[i]['id']}');" ondblclick="apps.explorer.open_file('${tmp[i]['id']}', '${tmp[i]['name']}')">
                            <span style="width: 40%;"><img style="float: left;" src="${f_src}" alt="">${tmp[i]['name']}</span><span style="width: 10%;">${tmp[i]['format']}</span>
                            <span style="width: 10%;">${tmp[i]['size']}</span><span style="width: 20%;">${tmp[i]['update_time']}</span><span style="width: 20%;">${tmp[i]['create_time']}</span></a></div>`;
                    }
                }
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = ht;
                document.querySelectorAll('.a.item').forEach(item => {
                    item.addEventListener('touchstart', function (e) {
                        startClientX = e.touches[0].clientX;
                        startClientY = e.touches[0].clientY;
                        endClientX = startClientX;
                        endClientY = startClientY;
                    }, false);
                    item.addEventListener('touchmove', function (e) {
                        endClientX = e.touches[0].clientX;
                        endClientY = e.touches[0].clientY;
                    }, false);
                    item.addEventListener('touchend', function (e) {
                        if (Math.abs(endClientX - startClientX) < 2 || Math.abs(endClientY - startClientY) < 2) {
                            item.ondblclick(e);
                        }
                    }, false);
                })
            }
        },
        share_list: () => {
            $('#win-explorer>.page>.menu>.card>list>a')[2].className ='check';
            $('#win-explorer>.page>.menu>.card>list>a')[2].querySelector('span').style.display='flex';
            $('#win-explorer>.page>.menu>.card>list>a')[1].className = '';
            $('#win-explorer>.page>.menu>.card>list>a')[1].querySelector('span').style.display='none';
            $('#win-explorer>.page>.menu>.card>list>a')[0].className = '';
            $('#win-explorer>.page>.menu>.card>list>a')[0].querySelector('span').style.display='none';
            $('#win-explorer>.path>.search')[0].style.display = 'none';
            $('#win-explorer>.path>.search>input')[0].value = '';
            $('#win-explorer>.page>.main')[0].style.display = 'none';
            $('#win-explorer>.page>.main-share')[0].style.display = 'flex';
            $('#win-explorer>.path>.back')[0].classList.add('disabled');
            m_tab.rename('explorer', '<img src="img/explorer/share.png" alt=""> '+i18next.t('explore.window.menu.share.title'));
            $.ajax({
                type: 'GET',
                url: server + '/share/list',
                success: function (data) {
                    if (data['code'] === 0) {
                        if (data['data'].length === 0) {
                            $('#win-explorer>.page>.main-share>.content>.header')[0].style.display = 'none';
                            $('#win-explorer>.page>.main-share>.content>.view')[0].innerHTML = '<p class="info">'+i18next.t('explore.window.file.list.empty.tips')+'</p>';
                        } else {
                            $('#win-explorer>.page>.main-share>.content>.header')[0].style.display = 'flex';
                            let ht = '';
                            data['data'].forEach(item => {
                                let f_src = icons[item['format']] || default_icon;
                                ht += `<div class="row" style="padding-left: 5px;"><div class="a item act file" style="cursor: auto;">
                            <span style="width: 38%;" onclick="apps.explorer.open_share('${item['id']}','${item['format']}');"><img style="float: left;" src="${f_src}" alt="">${item['name']}</span>
                            <span style="width: 12%;">${item['times']}</span><span style="width: 10%;">${item['total_times']}</span><span style="width: 20%;">${item['create_time']}</span>
                            <span style="width: 20%;"><a style="cursor: pointer; color: blue;" onclick="delete_file([${item['id']}], 'folder', 0, 3);">${i18next.t('setting.window.shell.server.list.action.delete')}</a><a style="margin-left: 10px; cursor: pointer; color: blue;" onclick="apps.explorer.open_share('${item['id']}','${item['format']}',false);">${i18next.t('explore.window.file.share.list.view.link')}</a></span></div></div>`;
                            })
                            $('#win-explorer>.page>.main-share>.content>.view')[0].innerHTML = ht;
                        }
                    } else {
                        $.Toast(data['msg'], 'error');
                    }
                }
            })
        },
        open_share: (share_id, share_format, is_open=true) => {
            let share_url = '';
            switch (share_format) {
                case 'md':
                    share_url = '/' + window.location.href.split('/')[3] + '/module/md.html?server=' + server + '&id=' + share_id;
                    break;
                case 'xmind':
                    share_url = '/' + window.location.href.split('/')[3] + '/module/xmind.html?server=' + server + '&id=' + share_id;
                    break;
                case 'sheet':
                    share_url = '/' + window.location.href.split('/')[3] + '/module/sheet.html?server=' + server + '&id=' + share_id + '&lang=' + lang;
                    break;
                case 'docu':
                    share_url = '/' + window.location.href.split('/')[3] + '/module/document.html?server=' + server + '&id=' + share_id + '&lang=' + lang;
                    break;
                case 'py':
                    share_url = '/' + window.location.href.split('/')[3] + '/module/python.html?server=' + server + '&id=' + share_id;
                    break;
                default:
                    share_url = server + '/share/get/' + share_id;
                    break;
            }
            if (is_open) {
                window.open(share_url);
            } else {
                let url_t = 'http://' + window.location.href.split('/')[2] + share_url;
                let textarea = document.createElement('textarea');
                textarea.value = url_t;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                alert(url_t);
            }
        },
        open_file: (file_id,filename) => {
            let filenames = filename.split('.');
            let format = filenames[filenames.length - 1].toLowerCase();
            switch (format) {
                case 'txt':
                    edit_text_file(file_id);
                    break;
                case 'md':
                    open_md(file_id);
                    break;
                case 'mp4':
                    apps.explorer.open_video(file_id, filename);
                    break;
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'bmp':
                case 'gif':
                    apps.explorer.open_picture(file_id, filename);
                    break
                case 'xmind':
                    open_xmind(file_id);
                    break;
                case 'sheet':
                    open_sheet(file_id);
                    break;
                case 'docu':
                    open_document(file_id, filename);
                    break;
                case 'py':
                    open_python(file_id);
                    break;
                default:
                    apps.explorer.download(file_id);
                    break;
            }
        },
        select: (id) => {
            // let element = document.getElementById('check' + id);
            // element.checked = !element.checked;
            apps.explorer.is_use += 1;
        },
        goto: (path, path_id, clear = true) => {
            $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '';
            let pathl = path.split('/');
            let pathlid = path_id.split('/');
            let pathqwq = '';
            let pathqwqid = '';
            let sort_field = 'update_time';
            let sort_type = 'desc';
            if (path === i18next.t('computer')) {
                apps.explorer.reset(clear);
                return null;
            }
            $('#win-explorer>.path>.tit')[0].dataset.path = path;
            $('#win-explorer>.path>.tit')[0].id=path_id;
            $('#win-explorer>.path>.tit>.path')[0].innerHTML = '<div class="text" onclick="apps.explorer.reset()">' + i18next.t('computer') +'</div><div class="arrow">&gt;</div>';
            $('#win-explorer>.path>.tit>.icon')[0].style.marginTop = '0px';
            document.getElementById("all_files").checked = false;
            document.querySelectorAll('#win-explorer>.page>.main>.content>.header>.row>span>button').forEach(item => {
                if (item.className) {
                    sort_field = item.id.split('-')[0];
                    sort_type = item.className;
                }
            })
            document.querySelector('#win-explorer>.page>.main>.tool').style.display = 'flex';
            document.querySelectorAll('#win-explorer>.page>.main>.tool>.asd').forEach(item => {
                item.style.display='flex';
            })
            document.querySelectorAll('#win-explorer>.page>.main>.tool>.dsa').forEach(item => {
                item.style.display='none';
            })
            if (path_id === 'C') {
                m_tab.rename('explorer', '<img src="img/explorer/diskwin.svg" style="margin-top:2.5px" alt="">' + pathl[pathl.length - 1]);
                return;
            }
            else if (pathlid[pathlid.length - 1].length === 1) {
                m_tab.rename('explorer', '<img src="img/explorer/disk.svg" alt="">' + pathl[pathl.length - 1]);
                tmp = queryAllFiles(pathlid[pathlid.length - 1], "", sort_field, sort_type);
            }
            else {
                m_tab.rename('explorer', '<img src="img/explorer/folder.svg" alt="">' + pathl[pathl.length - 1]);
                tmp = queryAllFiles(pathlid[pathlid.length - 1], "", sort_field, sort_type);
            }
            apps.explorer.tabs[apps.explorer.now][2] = path;
            apps.explorer.tabs[apps.explorer.now][3] = path_id;
            for(let i=0; i<pathl.length; i++) {
                pathqwq += pathl[i];
                pathqwqid += pathlid[i];
                $('#win-explorer>.path>.tit>.path')[0].innerHTML += `<div class="text" onclick="apps.explorer.goto('${pathqwq}', '${pathqwqid}')">${pathl[i]}</div><div class="arrow">&gt;</div>`;
                pathqwq += '/';
                pathqwqid += '/';
            }
            if (tmp.length === 0) {
                $('#win-explorer>.page>.main>.content>.header')[0].style.display = 'none';
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '<p class="info">'+i18next.t('explore.window.file.list.empty.tips')+'</p>';
            } else {
                let ht = '';
                $('#win-explorer>.page>.main>.content>.header')[0].style.display = 'flex';
                for(let i=0; i<tmp.length; i++) {
                    if(tmp[i]['folder_type'] === 'folder') {
                        ht += `<div class="row" style="padding-left: 5px;"><input type="checkbox" id="check${tmp[i]['id']}" style="float: left; margin-top: 8px;margin-right: 8px;"><a class="a item files" id="f${tmp[i]['id']}" onclick="apps.explorer.select('${tmp[i]['id']}');" ondblclick="apps.explorer.goto('${path}/${tmp[i]['name']}', '${path_id}/${tmp[i]['id']}')" oncontextmenu="showcm(event,'explorer.folder','${path_id}/${tmp[i]['id']}');return stop(event);">
                            <span style="width: 40%;"><img style="float: left;" src="img/explorer/folder.svg" alt=""><p>${tmp[i]['name']}</p></span><span style="width: 10%;">${i18next.t('explore.window.file.list.folder.type.name')}</span>
                            <span style="width: 10%;"></span><span style="width: 20%;">${tmp[i]['update_time']}</span><span style="width: 20%;">${tmp[i]['create_time']}</span></a></div>`;
                    } else {
                        let f_src = icons[tmp[i]['format']] || default_icon;
                        ht += `<div class="row" style="padding-left: 5px;"><input type="checkbox" id="check${tmp[i]['id']}" style="float: left; margin-top: 8px;margin-right: 8px;"><a class="a item act file" id="f${tmp[i]['id']}" onclick="apps.explorer.select('${tmp[i]['id']}');" ondblclick="apps.explorer.open_file('${tmp[i]['id']}', '${tmp[i]['name']}')" oncontextmenu="showcm(event,'explorer.file','${path_id}/${tmp[i]['id']}');return stop(event);">
                            <span style="width: 40%;"><img style="float: left;" src="${f_src}" alt="">${tmp[i]['name']}</span><span style="width: 10%;">${tmp[i]['format']}</span>
                            <span style="width: 10%;">${tmp[i]['size']}</span><span style="width: 20%;">${tmp[i]['update_time']}</span><span style="width: 20%;">${tmp[i]['create_time']}</span></a></div>`;
                    }
                }
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = ht;
                document.querySelectorAll('.a.item').forEach(item => {
                    item.addEventListener('touchstart', function (e) {
                        startClientX = e.touches[0].clientX;
                        startClientY = e.touches[0].clientY;
                        endClientX = startClientX;
                        endClientY = startClientY;
                    }, false);
                    item.addEventListener('touchmove', function (e) {
                        endClientX = e.touches[0].clientX;
                        endClientY = e.touches[0].clientY;
                    }, false);
                    item.addEventListener('touchend', function (e) {
                        if (Math.abs(endClientX - startClientX) < 2 || Math.abs(endClientY - startClientY) < 2) {
                            item.ondblclick(e);
                        }
                    }, false);
                })
            }
            if (pathl.length === 1) {
                $('#win-explorer>.path>.goback').attr('onclick', 'apps.explorer.reset()');
                $('#win-explorer>.path>.back').attr('onclick', 'apps.explorer.reset()');
            } else {
                $('#win-explorer>.path>.goback').attr('onclick', `apps.explorer.goto('${path.substring(0, path.length - pathl[pathl.length - 1].length - 1)}', '${path_id.substring(0, path_id.length - pathlid[pathlid.length - 1].length - 1)}')`);
                $('#win-explorer>.path>.back').attr('onclick', `apps.explorer.goto('${path.substring(0, path.length - pathl[pathl.length - 1].length - 1)}', '${path_id.substring(0, path_id.length - pathlid[pathlid.length - 1].length - 1)}')`);
            }
            // $('#win-explorer>.path>.tit')[0].innerHTML = path;
        },
        add: (path_id, type = "file", file_type="txt") => {
            let paths = path_id.split('/');
            let post_data = {
                id: paths[paths.length - 1],
                type: type,
                file_type: file_type
            }
            $.ajax({
                type: 'POST',
                url: server + '/create',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                async: false,
                success: function (data) {
                    if (data['code'] === 0) {
                        $.Toast(data['msg'], 'success');
                    } else {
                        $.Toast(data['msg'], 'error');
                    }
                }
            })
            apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, path_id);
        },
        rename: (path) => {
            let pathl = path.split('/');
            let name = pathl[pathl.length - 1];
            let element = document.querySelector('#f' + name).querySelectorAll('span')[0];
            let old_name = element.innerText;
            element.innerHTML = element.querySelector("img").outerHTML;
            let input = document.createElement("input");
            input.id = "new_name";
            input.className = "input";
            input.value = old_name;
            input.style.width = element.clientWidth - 35 + 'px';
            element.appendChild(input);
            setTimeout(() => { $("#new_name").focus(); $("#new_name").select(); }, 200);
            element.classList.add("change");
            let input_ = document.getElementById("new_name");
            input_.addEventListener("keyup", function (event) {
                if (event.key === "Enter") {
                    if (old_name !== input_.value) {
                        let file_type = 'file';
                        if (document.querySelector('#f' + name).classList.contains('files')) {
                            file_type = 'folder';
                        }
                        let post_data = {
                            id: name,
                            name: input_.value,
                            type: file_type
                        }
                        $.ajax({
                            type: 'POST',
                            url: server + '/rename',
                            async: false,
                            data: JSON.stringify(post_data),
                            contentType: 'application/json',
                            success: function (data) {
                                if (data['code'] === 0) {
                                    $.Toast(data['msg'], 'success');
                                } else {
                                    $.Toast(data['msg'], 'error');
                                }
                            }
                        })
                    }
                    apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
                }
            });
        },
        copy: (file_id) => {
            show_modal_cover();
            $.ajax({
                type: 'GET',
                url: server + '/file/copy/' + file_id,
                success: function (data) {
                    if (data['code'] === 0) {
                        $.Toast(data['msg'], 'success');
                        apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
                        close_modal_cover();
                    } else {
                        $.Toast(data['msg'], 'error');
                        close_modal_cover();
                    }
                }
            })
        },
        del: (path) => {
            let pathl = path.split('/');
            let name = pathl[pathl.length - 1];
            let file_type = 'file';
            if (document.querySelector('#f' + name).classList.contains('files')) {
                file_type = 'folder';
            }
            delete_file([name], file_type);
            apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
        },
        share: () => {
            let ids = getSelectedIds();
            if (ids.folder.length > 0) {
                $.Toast(i18next.t("msg.share.file.error1"), "error");
                return;
            }
            if (ids.file.length === 0) {
                $.Toast(i18next.t("msg.share.file.error2"), "error");
                return;
            }
            if (ids.file.length > 1) {
                $.Toast(i18next.t("msg.share.file.error3"), "error");
                return;
            }
            let share_times = document.getElementById('share-time').value;
            let post_data = {
                id: ids.file[0],
                times: parseInt(share_times)
            }
            $.ajax({
                type: 'POST',
                url: server + '/file/share',
                data: JSON.stringify(post_data),
                contentType: 'application/json',
                success: function (data) {
                    if (data['code'] === 0) {
                        $.Toast(data['msg'], 'success');
                        closenotice();
                    } else {
                        $.Toast(data['msg'], 'error');
                    }
                }
            })
        },
        download: (file_id) => {
            window.open(server + '/file/download/' + file_id);
        },
        export: () => {
            let ids = getSelectedIds();
            if (ids.folder.length + ids.file.length === 0) {
                $.Toast(i18next.t('msg.export.file.error1'), "error");
                return;
            }
            if (ids.folder.length > 0 && ids.file.length > 0) {
                $.Toast(i18next.t('msg.export.file.error2'), "error");
                return;
            }
            if (ids.folder.length > 0) {
                if (ids.folder.length === 1) {
                    export_file(ids.folder, 'folder');
                } else {
                    $.Toast(i18next.t('msg.export.file.error3'), "error");
                    return;
                }
            }
            if (ids.file.length > 0) {
                if (ids.file.length === 1) {
                    apps.explorer.download(ids.file[0]);
                } else {
                    export_file(ids.file, 'file');
                }
            }
        },
        open_video: (file_id, filename) => {
            openapp('video');
            $('.window.video')[0].style.width = 'auto';
            $('.window.video>.titbar>span>.title')[0].innerText = filename;
            $('#win-video')[0].innerHTML = '<video class="my_video" controls preload="metadata" data-setup="{}" playsinline><source src="' + server + '/video/play/' + file_id + '" type="video/mp4"><track src="" srcLang="'+lang+'" kind="subtitles" label="'+lang+'"></video>';
            document.getElementsByClassName('my_video')[0].addEventListener('loadedmetadata', function () {
                this.currentTime = localStorage.getItem(file_id);
            }, false);
            document.getElementsByClassName('my_video')[0].addEventListener('timeupdate', function (){
                if (this.currentTime > 0) {localStorage.setItem(file_id, this.currentTime);}
            }, false);
            document.getElementsByClassName('my_video')[0].addEventListener('ended', function () {
                localStorage.removeItem(file_id);
            }, false);
        },
        open_picture: (file_id, filename) => {
            $('#win-image>.my_video')[0].src = '';
            openapp('picture');
            $('.window.picture')[0].style.width='auto';
            $('.window.picture>.titbar>span>.title')[0].innerText = filename;
            $('#win-image>.my_video')[0].src = server + '/file/download/' + file_id;
            let viewer = new Viewer(document.querySelectorAll('#win-image>.my_video')[0], {viewed() {},});
        },
        history: [],
        historypt: [],
        initHistory: (tab) => {
            apps.explorer.history[tab] = [];
            apps.explorer.historypt[tab] = -1;
        },
        pushHistory: (tab, u) => {
            apps.explorer.history[tab].push(u);
            apps.explorer.historypt[tab]++;
        },
        // topHistory: (tab) => {
        //     return apps.explorer.history[tab][apps.explorer.historypt[tab]];
        // },
        popHistory: (tab) => {
            apps.explorer.historypt[tab]--;
            return apps.explorer.history[tab][apps.explorer.historypt[tab]];
        },
        incHistory: (tab) => {
            apps.explorer.historypt[tab]++;
            return apps.explorer.history[tab][apps.explorer.historypt[tab]];
        },
        delHistory: (tab) => {
            apps.explorer.history[tab].splice(apps.explorer.historypt[tab] + 1, apps.explorer.history[tab].length - 1 - apps.explorer.historypt[tab]);
        },
        historyIsEmpty: (tab) => {
            return apps.explorer.historypt[tab] <= 0;
        },
        historyIsFull: (tab) => {
            return apps.explorer.historypt[tab] >= apps.explorer.history[tab].length - 1;
        },
        checkHistory: (tab) => {
            if (apps.explorer.historyIsEmpty(tab)) {
                $('#win-explorer>.path>.back').addClass('disabled');
            }
            else {
                $('#win-explorer>.path>.back').removeClass('disabled');
            }
            if (apps.explorer.historyIsFull(tab)) {
                $('#win-explorer>.path>.front').addClass('disabled');
            }
            else if (!apps.explorer.historyIsFull(tab)) {
                $('#win-explorer>.path>.front').removeClass('disabled');
            }
        },
        back: (tab) => {
            apps.explorer.goto(apps.explorer.popHistory(tab), false);
            apps.explorer.checkHistory(tab);
        },
        // front: (tab) => {
        //     apps.explorer.goto(apps.explorer.incHistory(tab), false);
        //     apps.explorer.checkHistory(tab);
        // }
    },
    calc: {
        init: () => {
            document.getElementById('calc-input').innerHTML = "0";
            if ($('.window.calc>link').length < 1) {
                let css_link = document.createElement('link');
                css_link.setAttribute('rel', 'stylesheet');
                css_link.setAttribute('href', 'css/calc.css');
                $('.window.calc')[0].appendChild(css_link);
            }
            if ($('.window.calc>script').length < 1) {
                let script = document.createElement('script');
                script.setAttribute('src', 'js/calculator_kernel.js');
                $('.window.calc')[0].appendChild(script);
                script = document.createElement('script');
                script.setAttribute('src', 'js/big.min.js');
                $('.window.calc')[0].appendChild(script);
            }
        }
    },
    notepad: {
        init: () => {
            $('#win-notepad>.text-box').addClass('down');
            if ($('.window.notepad>link').length < 1) {
                let css_link = document.createElement('link');
                css_link.setAttribute('rel', 'stylesheet');
                css_link.setAttribute('href', 'css/notepad.css');
                $('.window.notepad')[0].appendChild(css_link);
            }
            setTimeout(() => {
                $('#win-notepad>.text-box').val('');
                $('#win-notepad>.text-box').removeClass('down')
            }, 200);
        }
    },
    markdown: {init: () => {return null;}},
    video: {init: () => {return null;}},
    xmind: {init: () => {return null;}},
    sheet: {init: () => {return null;}},
    docu: {init: () => {return null;}},
    picture: {init: () => {return null;}},
    pythonEditor: {init: () => {return null;}},
    python: {
        codeCache: '',
        prompt: '>>> ',
        indent: false,
        load: () => {
            if ($('.window.python>link').length < 1) {
                let css_link = document.createElement('link');
                css_link.setAttribute('rel', 'stylesheet');
                css_link.setAttribute('href', 'css/terminal.css');
                $('.window.python')[0].appendChild(css_link);
            }
            if ($('.window.python>script').length < 1) {
                let script_link = document.createElement('script');
                script_link.setAttribute('type', 'text/javascript');
                script_link.setAttribute('src', 'module/python/pyodide.js');
                script_link.onload = function () {
                    (async function () {
                        apps.python.pyodide = await loadPyodide();
                        apps.python.pyodide.runPython(`
                    import sys
                    import io
                    `);
                    })();
                }
                $('.window.python')[0].appendChild(script_link);
            } else {
                (async function () {
                    apps.python.pyodide = await loadPyodide();
                    apps.python.pyodide.runPython(`
                import sys
                import io
                `);
                })();
            }
        },
        init: () => {
            $('#win-python').html(`
        <pre>
Python 3.10.2  [MSC v.1912 64 bit (AMD64)] :: Anaconda, Inc. on win32
Type "help", "copyright", "credits" or "license" for more information.
        </pre>
        <pre class="text-cmd"></pre>
        <pre style="display: flex;"><span class='prompt'>>>> </span><input type="text" onkeyup="if (event.keyCode === 13) { apps.python.run(); }"></pre>`);
        },
        run: () => {
            if (apps.python.pyodide) {
                const input = $('#win-python>pre>input');
                const _code = input.val();
                if (_code === "exit()") {
                    hidewin('python');
                    input.val('');
                }
                else {
                    const elt = $('#win-python>pre.text-cmd')[0];
                    const lastChar = _code[_code.length - 1];
                    let newD = document.createElement('div');
                    newD.innerText = `${apps.python.prompt}${_code}`;
                    elt.appendChild(newD);
                    if (lastChar !== ':' && lastChar !== '\\' && ((!apps.python.indent || _code === ''))) {
                        apps.python.prompt = '>>> ';
                        apps.python.codeCache += _code;
                        apps.python.indent = false;
                        const code = apps.python.codeCache;
                        apps.python.codeCache = '';
                        apps.python.pyodide.runPython('sys.stdout = io.StringIO()');
                        try {
                            const result = String(apps.python.pyodide.runPython(code));
                            if (apps.python.pyodide.runPython('sys.stdout.getvalue()')) {
                                newD = document.createElement('div');
                                newD.innerText = `${apps.python.pyodide.runPython('sys.stdout.getvalue()')}`;
                                elt.appendChild(newD);
                            }
                            if (result && result !== 'undefined') {
                                newD = document.createElement('div');
                                if (result === 'false') {
                                    newD.innerText = 'False';
                                }
                                else if (result === 'true') {
                                    newD.innerText = 'True';
                                }
                                else {
                                    newD.innerText = result;
                                }
                                elt.appendChild(newD);
                            }
                        }
                        catch (err) {
                            newD = document.createElement('div');
                            newD.innerText = `${err.message}`;
                            elt.appendChild(newD);
                        }
                    }
                    else {
                        apps.python.prompt = '... ';
                        if (lastChar === ':') {
                            apps.python.indent = true;
                        }
                        apps.python.codeCache += _code + '\n';
                    }
                    input.val('');

                    // 自动聚焦
                    input.blur();
                    input.focus();

                    $('#win-python .prompt')[0].innerText = apps.python.prompt;
                }
            }
        }
    },
    edge: {
        init: () => {
            $('#win-edge>iframe').remove();
            apps.edge.tabs = [];
            apps.edge.len = 0;
            apps.edge.newtab();
        },
        tabs: [],
        now: null,
        len: 0,
        history: [],
        historypt: [],
        reloadElt: '<loading class="reloading"><svg viewBox="0 0 16 16"><circle cx="8px" cy="8px" r="5px"></circle><circle cx="8px" cy="8px" r="5px"></circle></svg></loading>',
        max: false,
        fuls: false,
        b1: false, b2: false, b3: false,
        newtab: () => {
            m_tab.newtab('edge', i18next.t('tab.new'));
            apps.edge.initHistory(apps.edge.tabs[apps.edge.tabs.length - 1][0]);
            apps.edge.pushHistory(apps.edge.tabs[apps.edge.tabs.length - 1][0], 'https://bing.com');
            $('#win-edge').append(`<iframe id="iframe_edge" src="module/edge/mainpage.html" class="${apps.edge.tabs[apps.edge.tabs.length - 1][0]}">`);
            $('#win-edge>.tool>input.url').focus();
            $("#win-edge>iframe")[apps.edge.tabs.length - 1].onload = function () {
                this.contentDocument.querySelector('input').onkeyup = function (e) {
                    if (e.keyCode === 13 && $(this).val() !== '') {
                        apps.edge.goto($(this).val());
                    }
                }
                this.contentDocument.querySelector('svg').onclick = () => {
                    if ($(this.contentDocument.querySelector('input')).val() !== '') {
                        apps.edge.goto($(this.contentDocument.querySelector('input')).val())
                    }
                }
            };
            m_tab.tab('edge', apps.edge.tabs.length - 1);
            apps.edge.checkHistory(apps.edge.tabs[apps.edge.now][0]);
            $('#edge-path')[0].value = '';
        },
        fullscreen: () => {
            if (!apps.edge.max) {
                maxwin('edge');
                apps.edge.max = !apps.edge.max;
            }
            document.getElementById('fuls-edge').style.display = 'none';
            document.getElementById('edge-max').style.display = 'none';
            document.getElementById('fuls-edge-exit').style.display = '';
            document.getElementById('over-bar').style.display = '';
            $('.edge>.titbar').hide()
            $('.edge>.content>.tool').hide()
            apps.edge.fuls = !apps.edge.fuls;
        },
        exitfullscreen: () => {
            if (apps.edge.max) {
                maxwin('edge'); apps.edge.max = !apps.edge.max;
            }
            document.getElementById('fuls-edge').style.display = '';
            document.getElementById('edge-max').style.display = '';
            document.getElementById('fuls-edge-exit').style.display = 'none';
            document.getElementById('over-bar').style.display = 'none';
            $('.edge>.titbar').show()
            $('.edge>.content>.tool').show()
            apps.edge.fuls = !apps.edge.fuls;
        },
        in_div(id,event) {
            var div = document.getElementById(id);
            var x = event.clientX;
            var y = event.clientY;
            var divx1 = div.offsetLeft;
            var divy1 = div.offsetTop;
            var divx2 = div.offsetLeft + div.offsetWidth;
            var divy2 = div.offsetTop + div.offsetHeight;
            if (x < divx1 || x > divx2 || y < divy1 || y > divy2) {
                //如果离开，则执行。。
                return false;
            }
            else {
                //如检播到，则执行。。
                return true;
            }
        },
        settab: (t, i) => {
            if ($('.window.edge>.titbar>.tabs>.tab.' + t[0] + '>.reloading')[0]) {
                return `<div class="tab ${t[0]}" onclick="m_tab.tab('edge',${i})" oncontextmenu="showcm(event,'edge.tab',${i});stop(event);return false" onmousedown="m_tab.moving('edge',this,event,${i});stop(event);" ontouchstart="m_tab.moving('edge',this,event,${i});stop(event);">${apps.edge.reloadElt}<p>${t[1]}</p><span class="clbtn bi bi-x" onclick="m_tab.close('edge',${i})"></span></div>`;
            }
            else {
                return `<div class="tab ${t[0]}" onclick="m_tab.tab('edge',${i})" oncontextmenu="showcm(event,'edge.tab',${i});stop(event);return false" onmousedown="m_tab.moving('edge',this,event,${i});stop(event);" ontouchstart="m_tab.moving('edge',this,event,${i});stop(event);"><p>${t[1]}</p><span class="clbtn bi bi-x" onclick="m_tab.close('edge',${i})"></span></div>`;
            }
        },
        tab: (c) => {
            $('#win-edge>iframe.show').removeClass('show');
            $('#win-edge>iframe.' + apps.edge.tabs[c][0]).addClass('show');
            $('#win-edge>.tool>input.url').val($('#win-edge>iframe.' + apps.edge.tabs[c][0]).attr('src') == 'module/edge/mainpage.html' ? '' : $('#win-edge>iframe.' + apps.edge.tabs[c][0]).attr('src'));
            $('#win-edge>.tool>input.rename').removeClass('show');
            apps.edge.checkHistory(apps.edge.tabs[apps.edge.now][0]);
        },
        c_rename: (c) => {
            m_tab.tab('edge', c);
            $('#win-edge>.tool>input.rename').val(apps.edge.tabs[apps.edge.now][1]);
            $('#win-edge>.tool>input.rename').addClass('show');
            setTimeout(() => {
                $('#win-edge>.tool>input.rename').focus();
            }, 300);
        },
        reload: () => {
            $('#win-edge>iframe.show').attr('src', $('#win-edge>iframe.show').attr('src'));
            if (!$('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0] + '>.reloading')[0]) {
                $('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0])[0].insertAdjacentHTML('afterbegin', apps.edge.reloadElt);
                $('#win-edge>iframe.' + apps.edge.tabs[apps.edge.now][0])[0].onload = function () {
                    $('.window.edge>.titbar>.tabs>.tab.' + this.classList[0])[0].removeChild($('.window.edge>.titbar>.tabs>.tab.' + this.classList[0] + '>.reloading')[0]);
                }
            }
        },
        getTitle: async (url, np) => {
            const response = await fetch(server + '/forward' + `?url=${url}`);
            if (response.ok === true) {
                const text = await response.text();
                apps.edge.tabs[np][1] = text;
                m_tab.settabs('edge');
                m_tab.tab('edge', np);
            }
        },
        goto: (u, clear = true) => {
            if (!/^https?:\/\/([a-zA-Z0-9.-]+)(:\d+)?/.test(u) && !u.match(/^mainpage.html$/)) {
                // 启用必应搜索
                $('#win-edge>iframe.show').attr('src', 'https://bing.com/search?q=' + encodeURIComponent(u));
                m_tab.rename('edge', u);
            }
            // 检测网址是否带有http头
            else if (!/^https?:\/\//.test(u) && !u.match(/^mainpage.html$/)) {
                $('#win-edge>iframe.show').attr('src', 'http://' + u);
                m_tab.rename('edge', 'http://' + u);
            }
            else {
                $('#win-edge>iframe.show').attr('src', u);
                m_tab.rename('edge', u.match(/^mainpage.html$/) ? i18next.t('tab.new') : u);
            }
            if (!$('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0] + '>.reloading')[0]) {
                $('.window.edge>.titbar>.tabs>.tab.' + apps.edge.tabs[apps.edge.now][0])[0].insertAdjacentHTML('afterbegin', apps.edge.reloadElt);
            }
            $('#win-edge>iframe.' + apps.edge.tabs[apps.edge.now][0])[0].onload = function () {
                $('.window.edge>.titbar>.tabs>.tab.' + this.classList[0])[0].removeChild($('.window.edge>.titbar>.tabs>.tab.' + this.classList[0] + '>.reloading')[0]);
            }
            // apps.edge.getTitle($('#win-edge>iframe.show').attr('src'), apps.edge.now);
            if (clear) {
                apps.edge.delHistory(apps.edge.tabs[apps.edge.now][0]);
                apps.edge.pushHistory(apps.edge.tabs[apps.edge.now][0], $('#win-edge>iframe.show').attr('src'));
            }
            apps.edge.checkHistory(apps.edge.tabs[apps.edge.now][0]);
        },
        initHistory: (tab) => {
            apps.edge.history[tab] = [];
            apps.edge.historypt[tab] = -1;
        },
        pushHistory: (tab, u) => {
            apps.edge.history[tab].push(u);
            apps.edge.historypt[tab]++;
        },
        topHistory: (tab) => {
            return apps.edge.history[tab][apps.edge.historypt[tab]];
        },
        popHistory: (tab) => {
            apps.edge.historypt[tab]--;
            return apps.edge.history[tab][apps.edge.historypt[tab]];
        },
        incHistory: (tab) => {
            apps.edge.historypt[tab]++;
            return apps.edge.history[tab][apps.edge.historypt[tab]];
        },
        delHistory: (tab) => {
            apps.edge.history[tab].splice(apps.edge.historypt[tab] + 1, apps.edge.history[tab].length - 1 - apps.edge.historypt[tab]);
        },
        historyIsEmpty: (tab) => {
            return apps.edge.historypt[tab] <= 0;
        },
        historyIsFull: (tab) => {
            return apps.edge.historypt[tab] >= apps.edge.history[tab].length - 1;
        },
        checkHistory: (tab) => {
            if (apps.edge.historyIsEmpty(tab)) {
                $('#win-edge>.tool>.back').addClass('disabled');
            }
            else if (!apps.edge.historyIsEmpty(tab)) {
                $('#win-edge>.tool>.back').removeClass('disabled');
            }
            if (apps.edge.historyIsFull(tab)) {
                $('#win-edge>.tool>.front').addClass('disabled');
            }
            else if (!apps.edge.historyIsFull(tab)) {
                $('#win-edge>.tool>.front').removeClass('disabled');
            }
        },
        back: (tab) => {
            apps.edge.goto(apps.edge.popHistory(tab), false);
            apps.edge.checkHistory(tab);
        },
        front: (tab) => {
            apps.edge.goto(apps.edge.incHistory(tab), false);
            apps.edge.checkHistory(tab);
        }
    }
}

// 日期、时间
let da = new Date();
let date = `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][da.getDay()]}, ${da.getFullYear()}-${(da.getMonth() + 1).toString().padStart(2, '0')}-${da.getDate().toString().padStart(2, '0')}`;
if (lang === 'zh-CN') {date = `星期${['日', '一', '二', '三', '四', '五', '六'][da.getDay()]}, ${da.getFullYear()}-${(da.getMonth() + 1).toString().padStart(2, '0')}-${da.getDate().toString().padStart(2, '0')}`;}
$('#s-m-r>.row1>.tool>.date').text(date);
$('.dock.date>.date').text(`${da.getFullYear()}/${(da.getMonth() + 1).toString().padStart(2, '0')}/${da.getDate().toString().padStart(2, '0')}`);
$('#datebox>.tit>.date').text(date);
function loadtime() {
    let ddd = new Date();
    let time = `${ddd.getHours().toString().padStart(2, '0')}:${ddd.getMinutes().toString().padStart(2, '0')}:${ddd.getSeconds().toString().padStart(2, '0')}`
    $('#s-m-r>.row1>.tool>.time').text(time);
    $('.dock.date>.time').text(time);
    $('#datebox>.tit>.time').text(time);
}
loadtime();
setTimeout('loadtime();setInterval(loadtime, 1000);', 1000 - da.getMilliseconds());//修复时间不精准的问题。以前的误差：0-999毫秒；现在：几乎没有
let ddd = new Date();
let today = new Date().getDate();
let start = 7 - ((ddd.getDate() - ddd.getDay()) % 7) + 1;
let daysum = new Date(ddd.getFullYear(), ddd.getMonth() + 1, 0).getDate();
for (let i = 1; i < start; i++) {
    $('#datebox>.cont>.body')[0].innerHTML += '<span></span>';
}
for (let i = 1; i <= daysum; i++) {
    if (i === today) {
        $('#datebox>.cont>.body')[0].innerHTML += `<p class="today">${i}</p>`;
        continue;
    }
    $('#datebox>.cont>.body')[0].innerHTML += `<p>${i}</p>`;
}

// 应用与窗口
let other_img = ['video', 'picture', 'markdown', 'xmind', 'sheet', 'docu', 'pythonEditor']
function openapp(name) {
    if ($('#taskbar>.' + name).length !== 0) {
        if ($('.window.' + name).hasClass('min')) {
            minwin(name);
        }
        focwin(name);
        return;
    }
    let source_src = `img/${name}.svg`;
    if (other_img.indexOf(name) > -1) {
        source_src = icons[name];
    }
    $('.window.' + name).addClass('load');
    showwin(name);
    $('#taskbar').attr('count', Number($('#taskbar').attr('count')) + 1);
    $('#taskbar').append(`<a class="${name}" onclick="taskbarclick(\'${name}\')" win12_title="${$(`.window.${name}>.titbar>span>.title`).text()}" onmouseenter="showdescp(event)" onmouseleave="hidedescp(event)"><img src="${source_src}" alt=""></a>`);
    if ($('#taskbar').attr('count') === '1') {
        $('#taskbar').css('display', 'flex');
    }
    $('#taskbar>.' + name).addClass('foc');
    setTimeout(() => {
        $('#taskbar').css('width', 4 + $('#taskbar').attr('count') * (34 + 4));
    }, 0);
    let tmp = name.replace(/\-(\w)/g, function (all, letter) {
        return letter.toUpperCase();
    });
    if (apps[tmp].load && !apps[tmp].loaded) {
        apps[tmp].loaded = true;
        apps[tmp].load();
        apps[tmp].init();
        $('.window.' + name).removeClass('load');
        return;
    }
    apps[tmp].init();
    $('.window.' + name).removeClass('load');
    if (name === 'setting') {
        $('#win-setting>.menu>.user>div>p')[0].innerText = document.cookie.split('u=')[1].split(';')[0];
    }
}
// 窗口操作
function showwin(name) {
    $('.window.' + name).addClass('show-begin');
    setTimeout(() => { $('.window.' + name).addClass('show'); }, 0);
    setTimeout(() => { $('.window.' + name).addClass('notrans'); }, 20);
    $('.window.' + name).attr('style', `top:10%;left:15%;`);
    $('#taskbar>.' + wo[0]).removeClass('foc');
    $('.window.' + wo[0]).removeClass('foc');
    wo.splice(0, 0, name);
    orderwindow();
    $('.window.' + name).addClass('foc');
    if (!$('#control.show')[0] && !$('#datebox.show')[0]) {
        if ($('.window.max:not(.left):not(.right)')[0]) {
            $('#dock-box').addClass('hide');
        }
        else {
            $('#dock-box').removeClass('hide');
        }
    }
    else {
        $('#dock-box').removeClass('hide')
    }
}
function hidewin(name, arg = 'window') {
    $('.window.' + name).removeClass('notrans');
    $('.window.' + name).removeClass('max');
    $('.window.' + name).removeClass('show');
    if (arg === 'window') {
        $('#taskbar').attr('count', Number($('#taskbar').attr('count')) - 1)
        $('#taskbar>.' + name).remove();
        $('#taskbar').css('width', 4 + $('#taskbar').attr('count') * (34 + 4));
        setTimeout(() => {
            if ($('#taskbar').attr('count') === '0') {
                $('#taskbar').css('display', 'none');
            }
        }, 80);
    }
    setTimeout(() => {$('.window.' + name).removeClass('show-begin');}, 20);
    $('.window.' + name + '>.titbar>div>.wbtg.max').html('<i class="bi bi-app"></i>');
    wo.splice(wo.indexOf(name), 1);
    focwin(wo[wo.length - 1]);
    if (!$('#control.show')[0] && !$('#datebox.show')[0]) {
        if ($('.window.max:not(.left):not(.right)')[0]) {
            $('#dock-box').addClass('hide');
        }
        else {
            $('#dock-box').removeClass('hide');
        }
    }
    else {
        $('#dock-box').removeClass('hide')
    }
}
function maxwin(name, trigger = true) {
    if ($('.window.' + name).hasClass('max')) {
        $('.window.' + name).removeClass('left');
        $('.window.' + name).removeClass('right');
        $('.window.' + name).removeClass('max');
        $('.window.' + name + '>.titbar>div>.wbtg.max').html('<i class="bi bi-app"></i>');
        $('.window.' + name).addClass('notrans');
        if ($('.window.' + name).attr('data-pos-x') !== 'null' && $('.window.' + name).attr('data-pos-y') !== 'null') {
            $('.window.' + name).css('left', `${$('.window.' + name).attr('data-pos-x')}`);
            $('.window.' + name).css('top', `${$('.window.' + name).attr('data-pos-y')}`);
        }
    } else {
        if (trigger) {
            $('.window.' + name).attr('data-pos-x', `${$('.window.' + name).css('left')}`);
            $('.window.' + name).attr('data-pos-y', `${$('.window.' + name).css('top')}`);
        }
        $('.window.' + name).removeClass('notrans');
        $('.window.' + name).addClass('max');
        $('.window.' + name + '>.titbar>div>.wbtg.max').html('<svg version="1.1" width="12" height="12" viewBox="0,0,37.65105,35.84556" style="margin-top:4px;"><g transform="translate(-221.17804,-161.33903)"><g style="stroke:var(--text);" data-paper-data="{&quot;isPaintingLayer&quot;:true}" fill="none" fill-rule="nonzero" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" style="mix-blend-mode: normal"><path d="M224.68734,195.6846c-2.07955,-2.10903 -2.00902,-6.3576 -2.00902,-6.3576l0,-13.72831c0,0 -0.23986,-1.64534 2.00902,-4.69202c1.97975,-2.68208 4.91067,-2.00902 4.91067,-2.00902h14.06315c0,0 3.77086,-0.23314 5.80411,1.67418c2.03325,1.90732 1.33935,5.02685 1.33935,5.02685v13.39347c0,0 0.74377,4.01543 -1.33935,6.3576c-2.08312,2.34217 -5.80411,1.67418 -5.80411,1.67418h-13.39347c0,0 -3.50079,0.76968 -5.58035,-1.33935z"/><path d="M229.7952,162.85325h16.06111c0,0 5.96092,-0.36854 9.17505,2.64653c3.21412,3.01506 2.11723,7.94638 2.11723,7.94638v18.55642"/></g></g></svg>')
    }
    if (!$('#control.show')[0] && !$('#datebox.show')[0]) {
        if ($('.window.max:not(.left):not(.right)')[0]) {
            $('#dock-box').addClass('hide');
        }
        else {
            $('#dock-box').removeClass('hide');
        }
    }
    else {
        $('#dock-box').removeClass('hide')
    }
}
function minwin(name) {
    if ($('.window.' + name).hasClass('min')) {
        $('.window.' + name).addClass('show-begin');
        focwin(name);
        $('#taskbar>.' + name).removeClass('min');
        $('.window.' + name).removeClass('min');
        if ($('.window.' + name).hasClass('min-max')) {
            $('.window.' + name).addClass('max');
        }
        $('.window.' + name).removeClass('min-max');
        setTimeout(() => {
            if (!$('.window.' + name).hasClass('max')) {
                $('.window.' + name).addClass('notrans');
            }
        }, 20);
    } else {
        focwin(null);
        if ($('.window.' + name).hasClass('max')) {
            $('.window.' + name).addClass('min-max');
        }
        $('.window.' + name).removeClass('foc');
        $('.window.' + name).removeClass('max');
        $('#taskbar>.' + name).addClass('min');
        $('.window.' + name).addClass('min');
        $('.window.' + name).removeClass('notrans');
        setTimeout(() => { $('.window.' + name).removeClass('show-begin'); }, 20);
    }
}

function resizewin(win, arg, resizeElt) {
    page.onmousemove = function (e) {
        resizing(win, e, arg);
    }
    page.ontouchmove = function (e) {
        resizing(win, e, arg);
    }
    function up_f() {
        page.onmousedown = null;
        page.ontouchstart = null;
        page.onmousemove = null;
        page.ontouchmove = null;
        page.ontouchcancel = null;
        page.style.cursor = 'auto';
    }
    page.onmouseup = up_f;
    page.ontouchend = up_f;
    page.ontouchcancel = up_f;
    page.style.cursor = window.getComputedStyle(resizeElt, null).cursor;
}
function resizing(win, e, arg) {
    let x, y,
        minWidth = win.dataset.minWidth ? win.dataset.minWidth : 400,
        minHeight = win.dataset.minHeight ? win.dataset.minHeight : 300,
        offsetLeft = win.getBoundingClientRect().left,
        offsetTop = win.getBoundingClientRect().top,
        offsetRight = win.getBoundingClientRect().right,
        offsetBottom = win.getBoundingClientRect().bottom;
    if (e.type.match('mouse')) {
        x = e.clientX;
        y = e.clientY;
    }
    else if (e.type.match('touch')) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    }
    if (arg === 'right' && x - offsetLeft >= minWidth) {
        win.style.width = x - offsetLeft + 'px';
    }
    else if (arg === 'right') {
        win.style.width = minWidth + 'px';
    }

    if (arg === 'left' && offsetRight - x >= minWidth) {
        win.style.left = x + 'px';
        win.style.width = offsetRight - x + 'px';
    }
    else if (arg === 'left') {
        win.style.width = minWidth + 'px';
        win.style.left = offsetRight - minWidth + 'px';
    }

    if (arg === 'bottom' && y - offsetTop >= minHeight) {
        win.style.height = y - offsetTop + 'px';
    }
    else if (arg === 'bottom') {
        win.style.height = minHeight + 'px';
    }

    if (arg === 'top' && offsetBottom - y >= minHeight) {
        win.style.top = y + 'px';
        win.style.height = offsetBottom - y + 'px';
    }
    else if (arg === 'top') {
        win.style.top = offsetBottom - minHeight + 'px';
        win.style.height = minHeight + 'px';
    }

    if (arg === 'top-left') {
        if (offsetRight - x >= minWidth) {
            win.style.left = x + 'px';
            win.style.width = offsetRight - x + 'px';
        }
        else {
            win.style.left = offsetRight - minWidth + 'px';
            win.style.width = minWidth + 'px';
        }
        if (offsetBottom - y >= minHeight) {
            win.style.top = y + 'px';
            win.style.height = offsetBottom - y + 'px';
        }
        else {
            win.style.top = offsetBottom - minHeight + 'px';
            win.style.height = minHeight + 'px';
        }
    }

    else if (arg === 'top-right') {
        if (x - offsetLeft >= minWidth) {
            win.style.width = x - offsetLeft + 'px';
        }
        else {
            win.style.width = minWidth + 'px';
        }
        if (offsetBottom - y >= minHeight) {
            win.style.top = y + 'px';
            win.style.height = offsetBottom - y + 'px';
        }
        else {
            win.style.top = offsetBottom - minHeight + 'px';
            win.style.height = minHeight + 'px';
        }
    }

    else if (arg === 'bottom-left') {
        if (offsetRight - x >= minWidth) {
            win.style.left = x + 'px';
            win.style.width = offsetRight - x + 'px';
        }
        else {
            win.style.left = offsetRight - minWidth + 'px';
            win.style.width = minWidth + 'px';
        }
        if (y - offsetTop >= minHeight) {
            win.style.height = y - offsetTop + 'px';
        }
        else {
            win.style.height = minHeight + 'px';
        }
    }

    else if (arg === 'bottom-right') {
        if (x - offsetLeft >= minWidth) {
            win.style.width = x - offsetLeft + 'px';
        }
        else {
            win.style.width = minWidth + 'px';
        }
        if (y - offsetTop >= minHeight) {
            win.style.height = y - offsetTop + 'px';
        }
        else {
            win.style.height = minHeight + 'px';
        }
    }
}
let wo = [];
function orderwindow() {
    for (let i = 0; i < wo.length; i++) {
        const win = $('.window.' + wo[wo.length - i - 1]);
        if (topmost.includes(wo[wo.length - i - 1])) {
            win.css('z-index', 10 + i + 50/*这里的50可以改，不要太大，不然会覆盖任务栏；不要太小，不然就和普通窗口没有什么区别了。随着版本的更新，肯定会有更多窗口，以后就可以把数字改打一点点*/);
        } else {
            win.css('z-index', 10 + i);
        }
    }
}
// 以下函数基于bug运行，切勿改动！
function focwin(name, arg = 'window') {
    // if(wo[0]==name)return;
    if (arg === 'window') {
        $('#taskbar>.' + wo[0]).removeClass('foc');
        $('#taskbar>.' + name).addClass('foc');
    }
    $('.window.' + wo[0]).removeClass('foc');
    wo.splice(wo.indexOf(name), 1);
    wo.splice(0, 0, name);
    orderwindow();
    $('.window.' + name).addClass('foc');
}
function taskbarclick(name) {
    if ($('.window.' + name).hasClass('foc')) {
        minwin(name);
        // focwin(null); // 禁改
        return;
    }
    if ($('.window.' + name).hasClass('min')) {
        minwin(name);
    }
    focwin(name);
}

// 选择框
let chstX, chstY;
function ch(e) {
    $('#desktop>.choose').css('left', Math.min(chstX, e.clientX));
    $('#desktop>.choose').css('width', Math.abs(e.clientX - chstX));
    $('#desktop>.choose').css('display', 'block');
    $('#desktop>.choose').css('top', Math.min(chstY, e.clientY));
    $('#desktop>.choose').css('height', Math.abs(e.clientY - chstY));
}
$('#desktop')[0].addEventListener('mousedown', e => {
    chstX = e.clientX;
    chstY = e.clientY;
    this.onmousemove = ch;
})
window.addEventListener('mouseup', e => {
    this.onmousemove = null;
    $('#desktop>.choose').css('left', 0);
    $('#desktop>.choose').css('top', 0);
    $('#desktop>.choose').css('display', 'none');
    $('#desktop>.choose').css('width', 0);
    $('#desktop>.choose').css('height', 0);
})
// 主题
function toggletheme() {
    $('.dock.theme').toggleClass('dk');
    $(':root').toggleClass('dark');
    if ($(':root').hasClass('dark')) {
        $('.window.whiteboard>.titbar>span>.title').text('Blackboard');
    } else {
        $('.window.whiteboard>.titbar>span>.title').text('Whiteboard');
    }
}

const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");
if (isDarkTheme.matches) { //是深色
    $('.dock.theme').toggleClass('dk');
    $(':root').toggleClass('dark');
    $('.window.whiteboard>.titbar>span>.title').text('Blackboard');
} else { // 不是深色
    $('.window.whiteboard>.titbar>span>.title').text('Whiteboard');
}
// 拖拽窗口
const page = document.getElementsByTagName('html')[0];
const titbars = document.querySelectorAll('.window>.titbar');
const wins = document.querySelectorAll('.window');
let deltaLeft = 0, deltaTop = 0, fil = false, filty = 'none', bfLeft = 0, bfTop = 0;
function win_move(e) {
    let cx, cy;
    if (e.type === 'touchmove') {
        cx = e.targetTouches[0].clientX, cy = e.targetTouches[0].clientY;
    }
    else {
        cx = e.clientX, cy = e.clientY;
    }
    // $(this).css('cssText', `left:${cx - deltaLeft}px;top:${cy - deltaTop}px;`);
    $(this).css('left', `${cx - deltaLeft}px`);
    $(this).css('top', `${cy - deltaTop}px`);
    if (cy <= 0) {
        // $(this).css('cssText', `left:${cx - deltaLeft}px;top:${-deltaTop}px`);
        $(this).css('left', `${cx - deltaLeft}px`);
        $(this).css('top', `${-deltaTop}px`);
        if (!(this.classList[1] in nomax)) {
            $('#window-fill').addClass('top');
            setTimeout(() => {
                $('#window-fill').addClass('fill');
            }, 0);
            fil = this;
            filty = 'top';
        }
    }
    else if (cx <= 0) {
        $(this).css('left', `${-deltaLeft}px`);
        $(this).css('top', `${cy - deltaTop}px`);
        if (!(this.classList[1] in nomax)) {
            $('#window-fill').addClass('left');
            setTimeout(() => {
                $('#window-fill').addClass('fill');
            }, 0);
            fil = this;
            filty = 'left';
        }
    }
    else if (cx >= document.body.offsetWidth - 2) {
        $(this).css('left', `calc(100% - ${deltaLeft}px)`);
        $(this).css('top', `${cy - deltaTop}px`);
        if (!(this.classList[1] in nomax)) {
            $('#window-fill').addClass('right');
            setTimeout(() => {
                $('#window-fill').addClass('fill');
            }, 0);
            fil = this;
            filty = 'right';
        }
    }
    else if (fil) {
        $('#window-fill').removeClass('fill');
        setTimeout(() => {
            $('#window-fill').removeClass('top');
            $('#window-fill').removeClass('left');
            $('#window-fill').removeClass('right');
        }, 200);
        fil = false;
        filty = 'none';
    }
    else if ($(this).hasClass('max')) {
        deltaLeft = deltaLeft / (this.offsetWidth - (45 * 3)) * ((0.7 * document.body.offsetWidth) - (45 * 3));
        maxwin(this.classList[1], false);
        $(this).css('left', `${cx - deltaLeft}px`);
        $(this).css('top', `${cy - deltaTop}px`);
        $('.window.' + this.classList[1] + '>.titbar>div>.wbtg.max').html('<i class="bi bi-app"></i>');

        $(this).addClass('notrans');
    }
}
for (let i = 0; i < wins.length; i++) {
    const win = wins[i];
    const titbar = titbars[i];
    titbar.addEventListener('mousedown', (e) => {
        let x = window.getComputedStyle(win, null).getPropertyValue('left').split("px")[0];
        let y = window.getComputedStyle(win, null).getPropertyValue('top').split("px")[0];
        if (y !== 0) {
            bfLeft = x;
            bfTop = y;
        }
        deltaLeft = e.clientX - x;
        deltaTop = e.clientY - y;
        page.onmousemove = win_move.bind(win);
    })
    titbar.addEventListener('touchstart', (e) => {
        let x = window.getComputedStyle(win, null).getPropertyValue('left').split("px")[0];
        let y = window.getComputedStyle(win, null).getPropertyValue('top').split("px")[0];
        if (y !== 0) {
            bfLeft = x;
            bfTop = y;
        }
        deltaLeft = e.targetTouches[0].clientX - x;
        deltaTop = e.targetTouches[0].clientY - y;
        page.ontouchmove = win_move.bind(win);
    })
}
page.addEventListener('mouseup', () => {
    page.onmousemove = null;
    if (fil) {
        if (filty === 'top') {
            maxwin(fil.classList[1], false);
        }
        else if (filty === 'left') {
            $(fil).addClass('left');
            maxwin(fil.classList[1], false);
        }
        else if (filty === 'right') {
            $(fil).addClass('right');
            maxwin(fil.classList[1], false);
        }
        setTimeout(() => {
            $('#window-fill').removeClass('fill');
            $('#window-fill').removeClass('top');
            $('#window-fill').removeClass('left');
            $('#window-fill').removeClass('right');
        }, 200);
        $('.window.' + fil.classList[1]).attr('data-pos-x', `${bfLeft}px`);
        $('.window.' + fil.classList[1]).attr('data-pos-y', `${bfTop}px`);
        fil = false;
    }
});
page.addEventListener('touchend', () => {
    page.ontouchmove = null;
    if (fil) {
        if (filty === 'top')
            maxwin(fil.classList[1], false);
        else if (filty === 'left') {
            maxwin(fil.classList[1], false);
            $(fil).addClass('left');
        } else if (filty === 'right') {
            maxwin(fil.classList[1], false);
            $(fil).addClass('right');
        }
        setTimeout(() => {
            $('#window-fill').removeClass('fill');
            $('#window-fill').removeClass('top');
            $('#window-fill').removeClass('left');
            $('#window-fill').removeClass('right');
        }, 200);
        setTimeout(() => {
            $('.window.' + fil.classList[1]).attr('data-pos-x', `${bfLeft}px`);
            $('.window.' + fil.classList[1]).attr('data-pos-y', `${bfTop}px`);
        }, 200);
        fil.setAttribute('style', `left:${bfLeft}px;top:${bfTop}px`);
        fil = false;
    }
});
page.addEventListener('mousemove', (e) => {
    if (e.clientY >= window.innerHeight - 60) {
        $('#dock-box').removeClass('hide');
    }
    else {
        if (!$('#control.show')[0] && !$('#datebox.show')[0]) {
            if ($('.window.max:not(.left):not(.right)')[0]) {
                $('#dock-box').addClass('hide');
            }
            else {
                $('#dock-box').removeClass('hide');
            }
        }
        else {
            $('#dock-box').removeClass('hide');
        }
    }
})
// 启动
document.getElementsByTagName('body')[0].onload = function nupd() {
    setTimeout(() => {
        $('#loadback').addClass('hide');
    }, 50);
    setTimeout(() => {
        $('#loadback').css('display', 'none');
    }, 100);
    document.querySelectorAll('.window').forEach(w => {
        let qw = $(w), wc = w.classList[1];
        // window: onmousedown="focwin('explorer')" ontouchstart="focwin('explorer')"
        qw.attr('onmousedown', `focwin('${wc}')`);
        qw.attr('ontouchstart', `focwin('${wc}')`);
        // titbar: oncontextmenu="return showcm(event,'titbar','edge')" ondblclick="maxwin('edge')"
        qw = $(`.window.${wc}>.titbar`);
        qw.attr('oncontextmenu', `return showcm(event,'titbar','${wc}')`);
        if (!(wc in nomax)) {
            qw.attr('ondblclick', `maxwin('${wc}')`);
        }
        // icon: onclick="return showcm(event,'titbar','explorer')"
        qw = $(`.window.${wc}>.titbar>.icon`);
        qw.attr('onclick', `let os=$(this).offset();stop(event);return showcm({clientX:os.left-5,clientY:os.top+this.offsetHeight+3},'titbar','${wc}')`);
        qw.mousedown(stop);
        $(`.window.${wc}>.titbar>div>.wbtg`).mousedown(stop);
    });
    document.querySelectorAll('.window>div.resize-bar').forEach(w => {
        for (const n of ['top', 'bottom', 'left', 'right', 'top-right', 'top-left', 'bottom-right', 'bottom-left']) {
            w.insertAdjacentHTML('afterbegin', `<div class="resize-knob ${n}" onmousedown="resizewin(this.parentElement.parentElement, '${n}', this)"></div>`);
        }
    });
};

function show_modal_cover(gif=true, progress=false) {
    $('.modal_cover')[0].style.display = 'flex';
    if (gif) {
        $('.modal_cover>.modal_gif')[0].style.display = 'flex';
    }
    if (progress) {
        $('.modal_cover>#progressBar')[0].style.display = 'flex';
    }
}

function close_modal_cover() {
    $('.modal_cover')[0].style.display = 'none';
    $('.modal_cover>.modal_gif')[0].style.display = 'none';
    $('.modal_cover>#progressBar')[0].style.display = 'none';
}

function get_current_time(is_year=false) {
    let curr_date = new Date();
    let curr_t = curr_date.getHours() + ":" + curr_date.getMinutes() + ":" + curr_date.getSeconds();
    if (is_year) {
        curr_t = curr_date.getFullYear() + "-" + curr_date.getMonth() + "-" + curr_date.getDay() + " " + curr_t;
    }
    return curr_t;
}

function getSelectedIds(is_all = false) {
    let ids = {folder: [], file: []};
    let items = document.querySelectorAll('#win-explorer>.page>.main>.content>.view>.row');
    let item_id = "";
    for (let i=0; i<items.length; i++) {
        if (is_all || items[i].getElementsByTagName('input')[0].checked) {
            item_id = items[i].getElementsByTagName('a')[0].id;
            if (items[i].getElementsByTagName('a')[0].classList.contains('files')) {
                ids.folder.push(item_id.slice(1, item_id.length));
            } else {
                ids.file.push(item_id.slice(1, item_id.length));
            }
        }
    }
    return ids;
}

function delete_file(ids, file_type, is_delete= 1, delete_type = 0) {
    let post_data = {
        ids: ids,
        file_type: file_type,
        is_delete: is_delete,
        delete_type: delete_type
    }
    $.ajax({
        type: 'POST',
        url: server + '/delete',
        async: false,
        data: JSON.stringify(post_data),
        contentType: 'application/json',
        success: function (data) {
            if (data['code'] === 0) {
                $.Toast(data['msg'], 'success');
                if (delete_type === 3) {
                    apps.explorer.share_list();
                }
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}

function rename_selected() {
    let ids = getSelectedIds();
    if (ids.folder.length + ids.file.length === 1) {
        let file_id = '';
        if (ids.folder.length > 0) {
            file_id = ids.folder[0];
        } else {
            file_id = ids.file[0];
        }
        apps.explorer.rename(file_id);
    } else {
        $.Toast(i18next.t('msg.rename.file.error1'), "error");
    }
}

function copy_selected() {
    let ids = getSelectedIds();
    if (ids.folder.length > 0) {
        $.Toast(i18next.t('msg.copy.file.error1'), "error");
        return;
    }
    if (ids.file.length === 0) {
        $.Toast(i18next.t('msg.copy.file.error2'), "error");
        return;
    }
    if (ids.file.length > 1) {
        $.Toast(i18next.t('msg.copy.file.error3'), "error");
        return;
    }
    apps.explorer.copy(ids.file[0]);
}

function delete_selected(del_type = 1, is_delete= 1, delete_type = 0) {
    if (delete_type === 1 || delete_type === 3) {
        show_modal_cover();
    }
    let ids = getSelectedIds();
    if (delete_type === 2) {
        ids = getSelectedIds(true);
    }
    if (ids.folder.length + ids.file.length === 0) {
        $.Toast(i18next.t('msg.export.file.error1'), "error");
        close_modal_cover();
        return;
    }
    if (ids.folder.length > 0) {
        delete_file(ids.folder, 'folder', is_delete, delete_type);
    }
    if (ids.file.length > 0) {
        delete_file(ids.file, 'file', is_delete, delete_type);
    }
    if (del_type === 0) {
        apps.explorer.garbage();
    } else {
        apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
    }
    if (delete_type === 1 || delete_type === 3) {
        close_modal_cover();
    }
}

document.getElementById('search-file').addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        let q = this.value;
        let sort_field = 'update_time';
        let sort_type = 'desc';
        if (q.trim() !== "") {
            document.querySelectorAll('#win-explorer>.page>.main>.content>.header>.row>span>button').forEach(item => {
                if (item.className) {
                    sort_field = item.id.split('-')[0];
                    sort_type = item.className;
                }
            })
            let tmp = queryAllFiles("search", q.trim(), sort_field, sort_type);
            if (tmp.length === 0) {
                $('#win-explorer>.page>.main>.content>.header')[0].style.display = 'none';
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = '<p class="info">搜索结果为空。</p>';
            } else {
                let ht = '';
                $('#win-explorer>.page>.main>.content>.header')[0].style.display = 'flex';
                for (let i = 0; i < tmp.length; i++) {
                    if(tmp[i]['folder_type'] === 'folder') {
                        ht += `<div class="row" style="padding-left: 5px;"><input type="checkbox" id="check${tmp[i]['id']}" style="float: left; margin-top: 8px;margin-right: 8px;"><a class="a item files" id="f${tmp[i]['id']}" onclick="apps.explorer.select('${tmp[i]['id']}');" ondblclick="apps.explorer.goto('${tmp[i]['name']}', '${tmp[i]['id']}')" oncontextmenu="showcm(event,'explorer.folder','${tmp[i]['id']}');return stop(event);">
                            <span style="width: 40%;"><img style="float: left;" src="img/explorer/folder.svg" alt=""><p>${tmp[i]['name']}</p></span><span style="width: 10%;">${i18next.t('explore.window.file.list.folder.type.name')}</span>
                            <span style="width: 10%;"></span><span style="width: 20%;">${tmp[i]['update_time']}</span><span style="width: 20%;">${tmp[i]['create_time']}</span></a></div>`;
                    } else {
                        let f_src = icons[tmp[i]['format']] || default_icon;
                        ht += `<div class="row" style="padding-left: 5px;"><input type="checkbox" id="check${tmp[i]['id']}" style="float: left; margin-top: 8px;margin-right: 8px;"><a class="a item act file" id="f${tmp[i]['id']}" onclick="apps.explorer.select('${tmp[i]['id']}');" ondblclick="apps.explorer.open_file('${tmp[i]['id']}', '${tmp[i]['name']}')" oncontextmenu="showcm(event,'explorer.file','${tmp[i]['id']}');return stop(event);">
                            <span style="width: 40%;"><img style="float: left;" src="${f_src}" alt="">${tmp[i]['name']}</span><span style="width: 10%;">${tmp[i]['format']}</span>
                            <span style="width: 10%;">${tmp[i]['size']}</span><span style="width: 20%;">${tmp[i]['update_time']}</span><span style="width: 20%;">${tmp[i]['create_time']}</span></a></div>`;
                    }
                }
                $('#win-explorer>.page>.main>.content>.view')[0].innerHTML = ht;
                document.querySelectorAll('.a.item').forEach(item => {
                    item.addEventListener('touchstart', function (e) {
                        startClientX = e.touches[0].clientX;
                        startClientY = e.touches[0].clientY;
                        endClientX = startClientX;
                        endClientY = startClientY;
                    }, false);
                    item.addEventListener('touchmove', function (e) {
                        endClientX = e.touches[0].clientX;
                        endClientY = e.touches[0].clientY;
                    }, false);
                    item.addEventListener('touchend', function (e) {
                        if (Math.abs(endClientX - startClientX) < 2 || Math.abs(endClientY - startClientY) < 2) {
                            item.ondblclick(e);
                        }
                    }, false);
                })
            }
        } else {
            $.Toast(i18next.t('msg.search.file.error1'), "error");
        }
    }
})

function move_files() {
    let root_disk = '';
    let ids = getSelectedIds();
    if (ids.folder.length + ids.file.length === 0) {
        $.Toast(i18next.t('msg.export.file.error1'), "error");
        return;
    }
    $.get(server + '/disk/get').then(res => {
        res.data.forEach(c => {
            root_disk = root_disk + `<ul class="domtree"><li onclick="get_folders('move${c['disk']}')"><img src="img/explorer/disk.svg" alt="">${c['disk']}:</li><ul id="move${c['disk']}"></ul></ul>`;
        });
        $('#notice>.cnt').html(`
                <p class="tit">${i18next.t('explore.window.file.tool.move.window.title')}</p>
                <div><input id="folder_name" type="text" value="" name="520" readonly></div>
                <div><label>${i18next.t('explore.window.file.tool.move.window.label')}</label><div id="folder-tree" style="overflow-y: scroll;">${root_disk}</div></div>
        `);
        $('#notice>.btns').html(`<a class="a btn main" onclick="move_file_folder();">${i18next.t('submit')}</a><a class="a btn detail" onclick="closenotice();">${i18next.t('cancel')}</a>`);
        $('#notice-back').addClass('show');
        $('#notice')[0].style.width = '50%';
        $('#notice')[0].style.height = $('#notice-back')[0].clientHeight * 0.8 + 'px';
        $('#folder-tree')[0].style.height = $('#notice-back')[0].clientHeight * 0.8 - 189 + 'px';
    });
}

function add_server_window() {
    $('#notice>.cnt').html(`
            <p class="tit">${i18next.t('setting.window.shell.server.add')}</p>
            <div style="margin-top:2%;"><label style="width:80px;display:inline-flex;margin-left:2%;">${i18next.t('setting.window.shell.server.add.ip.label')}</label><input id="server-host" type="text" placeholder="${i18next.t('setting.window.shell.server.add.ip.placeholder')}" style="width:80%;height:39px;"></div>
            <div style="margin-top:2%;"><label style="width:80px;display:inline-flex;margin-left:2%;">${i18next.t('setting.window.shell.server.add.user.label')}</label><input id="server-user" type="text" placeholder="${i18next.t('setting.window.shell.server.add.user.placeholder')}" value="root" style="width:80%;height:39px;"></div>
            <div style="margin-top:2%;"><label style="width:80px;display:inline-flex;margin-left:2%;">${i18next.t('setting.window.shell.server.add.port.label')}</label><input id="server-port" type="text" placeholder="${i18next.t('setting.window.shell.server.add.port.placeholder')}" value="22" style="width:80%;height:39px;"></div>
            <div style="margin-top:2%;"><label style="width:80px;display:inline-flex;margin-left:2%;">${i18next.t('setting.window.shell.server.add.pwd.label')}</label><input id="server-pwd" type="password" autocomplete="off" placeholder="${i18next.t('setting.window.shell.server.add.pwd.placeholder')}" style="width:80%;height:39px;"></div>
    `);
    $('#notice>.btns').html(`<a class="a btn main" onclick="add_server();">${i18next.t('submit')}</a><a class="a btn detail" onclick="closenotice();">${i18next.t('cancel')}</a>`);
    $('#notice-back').addClass('show');
    $('#notice')[0].style.width = '50%';
}

function move_file_folder() {
    show_modal_cover();
    let ids = getSelectedIds();
    let path_id = $('#win-explorer>.path>.tit')[0].id.split('/');
    let to_id = document.getElementById('folder_name').name;
    let move_flag = 0;
    if (ids.folder.length > 0) {
        move_flag = move_to(ids.folder, path_id[path_id.length - 1], to_id.slice(4, to_id.length), 'folder');
    }
    if (ids.file.length > 0) {
        move_flag = move_to(ids.file, path_id[path_id.length - 1], to_id.slice(4, to_id.length), 'file');
    }
    if (move_flag !== 0) {
        apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
    }
    close_modal_cover();
}

function move_to(from_ids, parent_id, to_id, folder_type) {
    if (parent_id === to_id) {
        $.Toast(i18next.t('msg.move.file.error1'), "error");
        return 0;
    }
    let post_data = {
        from_ids: from_ids,
        parent_id: parent_id,
        to_id: to_id,
        folder_type: folder_type
    }
    $.ajax({
        type: 'POST',
        url: server + '/move',
        async: false,
        data: JSON.stringify(post_data),
        contentType: 'application/json',
        success: function (data) {
            if (data['code'] === 0) {
                $.Toast(data['msg'], 'success');
                closenotice();
                return 1;
            } else {
                $.Toast(data['msg'], 'error');
                return 0;
            }
        }
    })
}

function get_folders(folder_id) {
    let abs_path = folder_id.slice(4, folder_id.length);
    $.ajax({
        type: "GET",
        url: server + "/folder/get/" + abs_path,
        success: function (data) {
            if (data['code'] === 0) {
                let s = '';
                data['data']['folder'].forEach(item => {
                    s = s + `<li onclick="get_folders('move${item['id']}')"><img src="img/explorer/folder.svg" alt="">${item['name']}</li><ul id="move${item['id']}"></ul>`;
                })
                document.getElementById(folder_id).innerHTML = s;
                let folder_name = document.getElementById('folder_name');
                folder_name.value = data['data']['path'];
                folder_name.name = folder_id;
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}

document.getElementById("all_files").addEventListener("click", function () {
    let items = document.querySelectorAll('#win-explorer>.page>.main>.content>.view>.row');
    for (let i=0; i<items.length; i++) {
        items[i].getElementsByTagName('input')[0].checked = this.checked;
    }
})

document.getElementById("id-sort").addEventListener("click", function () {
    change_asc_desc(this);
    apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
})

document.getElementById("name-sort").addEventListener("click", function () {
    change_asc_desc(this);
    apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
})

document.getElementById("update_time-sort").addEventListener("click", function () {
    change_asc_desc(this);
    apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
})

function queryAllFiles(parent_id, q="", sort_field='update_time', sort_type='desc') {
    let res = [];
    let url = server + '/file/get/' + parent_id + '?q=' + q + '&sort_field=' + sort_field + '&sort_type=' + sort_type;
    $.ajax({
        type: "GET",
        url: url,
        async: false,
        success: function (data) {
            if (data['code'] === 0) {
                res = data['data'];
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
    return res;
}

function change_asc_desc(element) {
    if (element.className) {
        if (element.className === 'asc') {
            element.className= 'desc';
        } else if (element.className === 'desc') {
            element.className= 'asc';
        }
    } else {
        element.className= 'desc';
    }
    let button_sort = document.querySelectorAll('#win-explorer>.page>.main>.content>.header>.row>span>button');
    button_sort.forEach(item => {
        if (item.id !== element.id) {
            item.className = '';
        }
    })
}

function export_file(ids, file_type) {
    show_modal_cover();
    let post_data = {
        ids: ids,
        file_type: file_type
    }
    $.ajax({
        type: 'POST',
        url: server + '/file/export',
        data: JSON.stringify(post_data),
        contentType: 'application/json',
        success: function (data) {
            if (data['code'] === 0) {
                apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
                close_modal_cover();
                apps.explorer.download(data['data']);
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}

function upload_file() {
    let fileUpload_input = document.getElementById("fileUpload-input");
    let folder_ids = $('#win-explorer>.path>.tit')[0].id;
    let folder_id = folder_ids.split('/');
    fileUpload_input.click();
    fileUpload_input.onchange = function (event) {
        let progressBar = document.getElementById("progressBar");
        show_modal_cover(false, true);
        let files = event.target.files;
        let total_files = files.length;
        if (total_files < 1) {
            close_modal_cover();
            return;
        }
        let success_num = 0;
        let fast_upload_num = 0;
        let failure_num = 0;
        let failure_file = [];
        progressBar.max = total_files;
        progressBar.value = success_num;

        for (let i=0; i<total_files; i++) {
            let form_data = new FormData();
            form_data.append("file", files[i]);
            form_data.append("index", i + 1);
            form_data.append("total", total_files);
            form_data.append("parent_id", folder_id[folder_id.length - 1]);

            let xhr = new XMLHttpRequest();
            xhr.open("POST", server + "/file/upload");
            xhr.setRequestHeader("processData", "false");
            // xhr.upload.onprogress = function(event) {
            //     if (event.lengthComputable) {}};
            // xhr.onload = function(event) {}
            xhr.onreadystatechange = function() {
                progressBar.value = success_num;
                if (xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        let res = JSON.parse(xhr.responseText);
                        if (res['code'] === 0) {
                            success_num += 1;
                        } else if (res['code'] === 2) {
                            fast_upload_num += 1;
                        } else {
                            failure_num += 1;
                            failure_file.push(res['data']);
                        }
                    }
                    if ((success_num + fast_upload_num + failure_num) === total_files) {
                        let msg = "";
                        let level = "success";
                        if (success_num > 0) {
                            msg += success_num + i18next.t('upload.file.success.tips');
                        }
                        if (fast_upload_num > 0) {
                            if (msg.length > 0) {msg += '，';}
                            msg += fast_upload_num + i18next.t('upload.file.already.tips');
                            level = "warning";
                        }
                        if (failure_num > 0) {
                            if (msg.length > 0) {msg += '，';}
                            msg += failure_num + i18next.t('upload.file.failure.tips');
                            level = "error";
                        }
                        $.Toast(msg, level);
                        if (failure_num > 0) {
                            shownotice('uploadResult');
                            let s = "";
                            for (let i=0; i<failure_file.length; i++) {
                                s += "<p>" + failure_file[i] + "</p>";
                            }
                            $('.upload-result')[0].innerHTML = s;
                        }
                        fileUpload_input.value = '';
                        apps.explorer.goto($('#win-explorer>.path>.tit')[0].dataset.path, $('#win-explorer>.path>.tit')[0].id);
                        close_modal_cover();
                    }
                }
            }
            xhr.send(form_data);
        }
    }
}

function upload_back_img() {
    let fileUpload_input = document.getElementById("back-img-input");
    fileUpload_input.click();
    fileUpload_input.onchange = function (event) {
        show_modal_cover();
        let files = event.target.files;
        let total_files = files.length;
        for (let i=0; i<total_files; i++) {
            let form_data = new FormData();
            form_data.append("file", files[i]);
            let file_type = files[i].type;
            if (file_type.indexOf('jpg') === -1 && file_type.indexOf('jpeg') === -1) {
                $.Toast(i18next.t('msg.upload.file.image.error1'), "error");
                return;
            }
            let xhr = new XMLHttpRequest();
            xhr.open("POST", server + "/img/upload");
            xhr.setRequestHeader("processData", "false");
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        let res = JSON.parse(xhr.responseText);
                        if (res['code'] === 0) {
                            $.Toast(res['msg'], 'success');
                            document.body.style.backgroundImage='url("img/pictures/' + document.cookie.split('u=')[1].split(';')[0] + '/background.jpg")';
                        } else {
                            $.Toast(res['msg'], 'error');
                        }
                    }
                    fileUpload_input.value = '';
                    close_modal_cover();
                }
            }
            xhr.send(form_data);
        }
    }
}

function play_local_video() {
    let play_local_video = document.getElementById("play_local_video");
    play_local_video.click();
    play_local_video.onchange = function (event) {
        let files = event.target.files;
        if (files.length !== 1) {
            return null;
        }
        openapp('video');
        $('.window.video')[0].style.width = 'auto';
        $('.window.video>.titbar>span>.title')[0].innerText = files[0].name;
        $('#win-video')[0].innerHTML = '<video class="my_video" controls preload="metadata" data-setup="{}" playsinline><source src="" type="video/mp4"><track src="" srcLang="'+lang+'" kind="subtitles" label="'+lang+'"></video>';
        let local_video = document.getElementsByClassName('my_video')[0];
        local_video.src = URL.createObjectURL(files[0]);
        local_video.load();
        let name_md5 = md5(files[0].name);
        local_video.addEventListener('loadedmetadata', function () {
            this.currentTime = localStorage.getItem(name_md5);
        }, false);
        local_video.addEventListener('timeupdate', function (){
            if (this.currentTime > 0) {localStorage.setItem(name_md5, this.currentTime);}
        }, false);
        local_video.addEventListener('ended', function () {
            localStorage.removeItem(name_md5);
        }, false);
    }
    play_local_video.value = '';
}

function modify_pwd() {
    let pwd1 = $('#setting-pwd1')[0].value;
    let pwd2 = $('#setting-pwd2')[0].value;
    let c = new Date().getTime().toString();
    if (pwd1 !== pwd2) {
        $.Toast(i18next.t('msg.modify.password.error1'), "error");
        return;
    }
    let post_data = {
        t: c,
        username: document.cookie.split('u=')[1].split(';')[0],
        password: parse_pwd(pwd1, c),
        password1: parse_pwd(pwd2, c)
    }
    $.ajax({
        type: 'POST',
        url: server + '/user/modify/pwd',
        data: JSON.stringify(post_data),
        contentType: 'application/json',
        success: function (data) {
            if (data['code'] === 0) {
                $.Toast(data['msg'], 'success');
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}

function close_video() {$('.my_video').attr('src', '');}

let txt_interval = null;
function edit_text_file(file_id) {
    clearInterval(txt_interval);
    openapp('notepad');
    $.ajax({
        type: 'GET',
        url: server + '/content/get/' + file_id,
        success: function (data) {
            if (data['code'] === 0) {
                $('.window.notepad>.titbar>span>.title')[0].innerText = data['msg'];
                $('#win-notepad>.text-box')[0].innerText = data['data'];
                $('#win-notepad>.text-box')[0].id = file_id;
                $('#win-notepad>a')[0].download = data['msg'].replace('txt', 'html');
                $('.window.notepad>.titbar>div>.wbtg.red').attr("onclick", `close_text_editor('${file_id}');hidewin('notepad');`);
                $('#notepad-length')[0].value = data['data'].length;
                txt_interval = window.setInterval(() => {
                    let text_data = $('#win-notepad>.text-box')[0].innerText;
                    let text_length = $('#notepad-length')[0].value;
                    if (text_data.length !== parseInt(text_length)) {
                        $('.window.notepad>.titbar>span>.save-status')[0].innerText = i18next.t('edit.online.saving.tips');
                        save_text_file(file_id, text_data);
                        $('#notepad-length')[0].value = text_data.length;
                        $('.window.notepad>.titbar>span>.save-status')[0].innerText = get_current_time() + i18next.t('edit.online.saved.tips');
                    }
                }, 10000);
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}

function close_text_editor(file_id) {
    clearInterval(txt_interval);
    $('.window.notepad>.titbar>span>.save-status')[0].innerText = i18next.t('edit.online.saving.tips');
    let text_data = $('#win-notepad>.text-box')[0].innerText;
    let text_length = $('#notepad-length')[0].value;
    if (text_data.length !== parseInt(text_length)) {
        save_text_file(file_id, text_data);
    }
    $('.window.notepad>.titbar>span>.save-status')[0].innerText = "";
    $('#win-notepad>.text-box')[0].innerText='';
}

function save_text_file(file_id, data, is_code=true) {
    let post_data = {id: file_id, data: data};
    $.ajax({
        type: 'POST',
        url: server + '/file/save',
        data: JSON.stringify(post_data),
        contentType: 'application/json',
        success: function (data) {
            if (data['code'] !== 0) {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}

function open_md(file_id) {
    openapp('markdown');
    document.getElementsByClassName("markdown")[0].style.display = 'block';
    document.getElementById("iframe_markdown").src = 'module/md.html?server=' + server + '&id=' + file_id;
    $('.window.markdown>.titbar>div>.wbtg.red').attr("onclick", `document.getElementById("iframe_markdown").contentWindow.close_md_editor('${file_id}');hidewin('markdown');`);
    $('.window.markdown>.titbar>div>.wbtg.export').attr("onclick", `document.getElementById("iframe_markdown").contentWindow.md2html();`);
}

function open_xmind(file_id) {
    openapp('xmind');
    document.getElementsByClassName("xmind")[0].style.display = 'block';
    document.getElementById("iframe_xmind").src = 'module/xmind.html?server=' + server + '&id=' + file_id;
    $('.window.xmind>.titbar>div>.wbtg.red').attr("onclick", `document.getElementById("iframe_xmind").contentWindow.close_xmind_editor('${file_id}');hidewin('xmind');`);
}

function open_sheet(file_id) {
    openapp('sheet');
    document.getElementsByClassName("sheet")[0].style.display = 'block';
    document.getElementById("iframe_sheet").src = 'module/sheet.html?server=' + server + '&id=' + file_id + '&lang=' + lang;
    $('.window.sheet>.titbar>div>.wbtg.red').attr("onclick", `document.getElementById("iframe_sheet").contentWindow.close_sheet_editor('${file_id}');hidewin('sheet');`);
}

function open_python(file_id) {
    openapp('pythonEditor');
    document.getElementsByClassName("pythonEditor")[0].style.display = 'block';
    document.getElementById("iframe_pythonEditor").src = 'module/python.html?server=' + server + '&id=' + file_id;
    $('.window.pythonEditor>.titbar>div>.wbtg.red').attr("onclick", `document.getElementById("iframe_pythonEditor").contentWindow.close_python_editor('${file_id}');hidewin('pythonEditor');`);
}

function open_document(file_id, file_name) {
    openapp('docu');
    document.getElementsByClassName("docu")[0].style.display = 'block';
    document.getElementById("iframe_docu").src = 'module/document.html?server=' + server + '&id=' + file_id + '&lang=' + lang;
    $('.window.docu>.titbar>div>.wbtg.red').attr("onclick", `document.getElementById("iframe_docu").contentWindow.close_document_editor('${file_id}');hidewin('docu');`);
    $('#win-docu>a')[0].download = file_name.replace('docu', 'html');
}

function get_server_list(event) {
    if (event.classList.contains('show')) {
        $('.dp.app-color').toggleClass('show');
        return;
    }
    $.ajax({
        type: 'GET',
        url: server + '/server/get',
        success: function (data) {
            if (data['code'] === 0) {
                let s = '';
                data['data'].forEach(item => {
                    s += `<div><div style="width: 16%;">${item['host']}</div><div>${item['port']}</div><div>${item['user']}</div><div style="width: 21%;">${item['system']}</div><div>${item['cpu']}${i18next.t('setting.window.shell.server.list.cpu.core')}</div><div>${item['mem']}G</div><div>${item['disk']}</div><div style="width:15%;"><a href="module/terminal.html?id=${item['id']}&host=${item['host']}&lang=${lang}" style="color:blue;">${i18next.t('setting.window.shell.server.list.action.open')}</a><a href="${server}/server/delete/${item['id']}" style="color:blue;margin-left:15px;">${i18next.t('setting.window.shell.server.list.action.delete')}</a></div></div><br />`;
                })
                $('.server-item')[0].innerHTML = s;
                $('.dp.app-color').toggleClass('show');
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}

function add_server() {
    let c = new Date().getTime().toString();
    if (!$('#server-host')[0].value || !$('#server-pwd')[0].value) {
        $.Toast(i18next.t('msg.server.add.error1'), "error");
        return;
    }
    let post_data = {
        t: c,
        host: $('#server-host')[0].value,
        port: $('#server-port')[0].value,
        user: $('#server-user')[0].value,
        pwd: parse_pwd($('#server-pwd')[0].value, c)
    }
    $.ajax({
        type: 'POST',
        url: server + '/server/add',
        data: JSON.stringify(post_data),
        contentType: 'application/json',
        success: function (data) {
            if (data['code'] === 0) {
                $.Toast(data['msg'], 'success');
                closenotice();
            } else {
                $.Toast(data['msg'], 'error');
            }
        }
    })
}
