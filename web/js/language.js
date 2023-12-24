function set_page_language() {
    // 登录页面
    $('#loginback>div>span')[0].innerText = i18next.t('login.username.label');
    $('#loginback>div>input')[0].placeholder = i18next.t('login.username.input.placeholder');
    $('#loginback>div>span')[1].innerText = i18next.t('login.password.label');
    $('#loginback>div>input')[1].placeholder = i18next.t('login.password.input.placeholder');
    $('#login')[0].innerText = i18next.t('login.button.text');

    // 桌面
    $('#desktop>div>p')[0].innerText = i18next.t('computer');
    $('#desktop>div')[0].setAttribute('win12_title', i18next.t('computer.title'));
    $('#desktop>div>p')[1].innerText = i18next.t('setting');
    $('#desktop>div')[1].setAttribute('win12_title', i18next.t('setting.title'));
    $('#desktop>div>p')[2].innerText = i18next.t('edge');
    $('#desktop>div')[2].setAttribute('win12_title', i18next.t('edge.title'));
    $('#desktop>div>p')[3].innerText = i18next.t('music');
    $('#desktop>div')[3].setAttribute('win12_title', i18next.t('music.title'));

    // 设置页面
    // 账号
    $('.window.setting>.titbar>span>span')[0].innerText = i18next.t('setting.window.title');
    $('#win-setting>.menu>.focs>.user>span')[0].innerText = i18next.t('setting.window.account');
    $('#win-setting>.page>.user>p')[0].innerText = i18next.t('setting.window.account');
    $('#win-setting>.page>.user>.setting-list>.modify-pwd>div>p')[0].innerText = i18next.t('setting.window.account.modify.pwd');
    $('#win-setting>.page>.user>.setting-list>.modify-pwd>div>p')[1].innerText = i18next.t('setting.window.account.modify.pwd.tips');
    $('#win-setting>.page>.user>.setting-list>.modify-pwd>label')[0].innerText = i18next.t('setting.window.account.modify.new.pwd');
    $('#win-setting>.page>.user>.setting-list>.modify-pwd>label')[1].innerText = i18next.t('setting.window.account.modify.new.pwd.again');
    $('#win-setting>.page>.user>.setting-list>.modify-pwd>a')[0].innerText = i18next.t('submit');
    $('#win-setting>.page>.user>.setting-list>.dp>div>p')[2].innerText = i18next.t('setting.window.account.logout');
    // 个性化
    $('#win-setting>.menu>.focs>.appearance>span')[0].innerText = i18next.t('setting.window.appearance');
    $('#win-setting>.page>.appearance>p')[0].innerText = i18next.t('setting.window.appearance');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[0].innerText = i18next.t('setting.window.appearance.background.image');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[1].innerText = i18next.t('setting.window.appearance.background.image.tips');
    $('#win-setting>.page>.appearance>.setting-list>.upload>a')[0].innerText = i18next.t('setting.window.appearance.background.image.upload');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[2].innerText = i18next.t('setting.window.appearance.theme.switch');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[3].innerText = i18next.t('setting.window.appearance.theme.switch.tips');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[4].innerText = i18next.t('setting.window.appearance.transparent.switch');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[5].innerText = i18next.t('setting.window.appearance.transparent.tips');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[6].innerText = i18next.t('setting.window.appearance.language');
    $('#win-setting>.page>.appearance>.setting-list>.dp>div>p')[7].innerText = i18next.t('setting.window.appearance.language.tips');
    // 视频
    $('#win-setting>.menu>.focs>.videos>span')[0].innerText = i18next.t('setting.window.videos');
    $('#win-setting>.page>.videos>p')[0].innerText = i18next.t('setting.window.videos');
    $('#win-setting>.page>.videos>.setting-list>.dp>div>p')[0].innerText = i18next.t('setting.window.videos.play.video');
    $('#win-setting>.page>.videos>.setting-list>.dp>div>p')[1].innerText = i18next.t('setting.window.videos.play.video.tips');
    // Terminal
    $('#win-setting>.menu>.focs>.shell>span')[0].innerText = i18next.t('setting.window.shell');
    $('#win-setting>.page>.shell>p')[0].innerText = i18next.t('setting.window.shell');
    $('#win-setting>.page>.shell>a')[0].innerText = i18next.t('setting.window.shell.server.add');
    $('#win-setting>.page>.shell>.setting-list>.dp>div>p')[0].innerText = i18next.t('setting.window.shell.server.my');
    $('#win-setting>.page>.shell>.setting-list>.dp>div>p')[1].innerText = i18next.t('setting.window.shell.server.my.tips');
    $('#win-setting>.page>.shell>.setting-list>.dp>.server-title>div')[1].innerText = i18next.t('setting.window.shell.server.list.port');
    $('#win-setting>.page>.shell>.setting-list>.dp>.server-title>div')[2].innerText = i18next.t('setting.window.shell.server.list.user');
    $('#win-setting>.page>.shell>.setting-list>.dp>.server-title>div')[3].innerText = i18next.t('setting.window.shell.server.list.system');
    $('#win-setting>.page>.shell>.setting-list>.dp>.server-title>div')[5].innerText = i18next.t('setting.window.shell.server.list.memory');
    $('#win-setting>.page>.shell>.setting-list>.dp>.server-title>div')[6].innerText = i18next.t('setting.window.shell.server.list.disk');
    $('#win-setting>.page>.shell>.setting-list>.dp>.server-title>div')[7].innerText = i18next.t('setting.window.shell.server.list.action');

    // 文件资源管理器
    $('.window.explorer>.titbar>span>.title')[0].innerText = i18next.t('explore.window.title');
    $('#search-file')[0].placeholder = i18next.t('explore.window.search.input.placeholder');
    $('#win-explorer>.page>.menu>.card>.title>span')[0].innerText = i18next.t('explore.window.menu.card.title');
    $('#win-explorer>.page>.menu>.card>list>a>span')[1].innerText = i18next.t('computer');
    $('#win-explorer>.page>.menu>.card>list>a>span')[3].innerText = i18next.t('explore.window.menu.garbage.title');
    $('#win-explorer>.page>.menu>.card>list>a>span')[5].innerText = i18next.t('explore.window.menu.share.title');
    $('#win-explorer>.page>.menu>.card>list>a>span')[6].innerText = i18next.t('explore.window.menu.calc.title');
    $('#win-explorer>.page>.menu>.card>list>a>span')[9].innerText = i18next.t('setting');
    $('#win-explorer>.page>.main>.tool>.dropdown-container>span')[0].innerText = i18next.t('explore.window.file.tool.file.title');
    $('#win-explorer>.page>.main>.tool>.dropdown-container>.dropdown-list>li')[0].innerText = i18next.t('explore.window.file.tool.file.title.txt');
    $('#win-explorer>.page>.main>.tool>.dropdown-container>.dropdown-list>li')[1].innerText = i18next.t('explore.window.file.tool.file.title.md');
    $('#win-explorer>.page>.main>.tool>.dropdown-container>.dropdown-list>li')[2].innerText = i18next.t('explore.window.file.tool.file.title.docu');
    $('#win-explorer>.page>.main>.tool>.dropdown-container>.dropdown-list>li')[3].innerText = i18next.t('explore.window.file.tool.file.title.sheet');
    $('#win-explorer>.page>.main>.tool>.dropdown-container>.dropdown-list>li')[4].innerText = i18next.t('explore.window.file.tool.file.title.xmind');
    $('#win-explorer>.page>.main>.tool>.dropdown-container>.dropdown-list>li')[5].innerText = i18next.t('explore.window.file.tool.file.title.py');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[0].title = i18next.t('explore.window.file.tool.folder.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[1].title = i18next.t('explore.window.file.tool.rename.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[2].title = i18next.t('explore.window.file.tool.move.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[3].title = i18next.t('explore.window.file.tool.copy.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[4].title = i18next.t('explore.window.file.tool.upload.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[5].title = i18next.t('explore.window.file.tool.export.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[6].title = i18next.t('explore.window.file.tool.share.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[7].title = i18next.t('explore.window.file.tool.restore.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[8].title = i18next.t('explore.window.file.tool.delete.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[9].title = i18next.t('explore.window.file.tool.delete1.title');
    $('#win-explorer>.page>.main>.tool>.a.b.act')[10].title = i18next.t('explore.window.file.tool.clear.title');
    $('#win-explorer>.page>.main>.content>.header>.row>span>span')[0].innerText = i18next.t('explore.window.file.list.header.name');
    $('#win-explorer>.page>.main>.content>.header>.row>span')[1].innerText = i18next.t('explore.window.file.list.header.type');
    $('#win-explorer>.page>.main>.content>.header>.row>span')[2].innerText = i18next.t('explore.window.file.list.header.size');
    $('#win-explorer>.page>.main>.content>.header>.row>span>span')[1].innerText = i18next.t('explore.window.file.list.header.update.time');
    $('#win-explorer>.page>.main>.content>.header>.row>span>span')[2].innerText = i18next.t('explore.window.file.list.header.create.time');
    $('#win-explorer>.page>.main-share>.content>.header>.row>span')[0].innerText = i18next.t('explore.window.file.list.header.name');
    $('#win-explorer>.page>.main-share>.content>.header>.row>span')[1].innerText = i18next.t('explore.window.file.share.list.header.times.open');
    $('#win-explorer>.page>.main-share>.content>.header>.row>span')[2].innerText = i18next.t('explore.window.file.share.list.header.times.total');
    $('#win-explorer>.page>.main-share>.content>.header>.row>span')[3].innerText = i18next.t('explore.window.file.share.list.header.time');
    $('#win-explorer>.page>.main-share>.content>.header>.row>span')[4].innerText = i18next.t('setting.window.shell.server.list.action');
    //edge
    $('#edge-path')[0].placeholder = i18next.t('edge.window.tool.input.placeholder');
    $('#edge-path-bar>a>i')[3].setAttribute('win12_title', i18next.t('edge.window.tool.tips'));
    // 其他
    $('.window.calc>.titbar>span>span')[0].innerText = i18next.t('explore.window.menu.calc.title');
    $('.window.notepad>.titbar>span>span')[0].innerText = i18next.t('explore.window.menu.notepad.title');
    $('.window.video>.titbar>span>span')[0].innerText = i18next.t('setting.window.videos');
    $('.window.picture>.titbar>span>span')[0].innerText = i18next.t('picture');
    $('.window.docu>.titbar>div>.export')[0].title = i18next.t('document.window.tool.download.title');
    $('.window.notepad>.titbar>div>.export')[0].title = i18next.t('document.window.tool.download.title');
    $('.window.markdown>.titbar>div>.export')[0].title = i18next.t('document.window.tool.download.title');
    $('.window.music>.titbar>span>.title')[0].innerText = i18next.t('music');
}