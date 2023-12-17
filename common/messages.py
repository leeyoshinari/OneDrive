#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

class Msg(object):
    Success = {'zh-CN': '成功',
               'en': ' successfully'}
    Failure = {'zh-CN': '失败',
               'en': ' failed'}
    CommonLog = {'zh-CN': '{}, 用户: {}, IP: {}',
                 'en': '{}, User: {}, IP: {}'}
    CommonLog1 = {'zh-CN': '{}, Id: {}, 用户: {}, IP: {}',
                  'en': '{}, Id: {}, User: {}, IP: {}'}
    Folder = {'zh-CN': '新建文件夹',
              'en': 'New Folder'}
    FileTxt = {'zh-CN': '新建文本文件',
               'en': 'New Text'}
    FileMd = {'zh-CN': '新建markdown文档.md',
              'en': 'New Markdown.md'}
    FileXmind = {'zh-CN': '新建脑图文件.xmind',
                 'en': 'New xmind.xmind'}
    FileSheet = {'zh-CN': '新建sheet工作表.sheet',
                 'en': 'New Worksheet.sheet'}
    FileDocu = {'zh-CN': '新建doc文档.docu',
                'en': 'New Document.docu'}
    FilePy = {'zh-CN': '新建python文件.py',
              'en': 'New Python.py'}
    MsgParamError = {'zh-CN': '参数错误',
                     'en': 'Parameter error'}
    MsgQuery = {'zh-CN': '查询',
                'en': 'Query'}
    MsgLogin = {'zh-CN': '{} 登陆',
                'en': '{} login'}
    MsgLogout = {'zh-CN': '{} 退出',
                 'en': '{} logout'}
    MsgLoginUserOrPwdError = {'zh-CN': '用户名或密码错误',
                              'en': 'Username or password is incorrect.'}
    MsgCreateUser = {'zh-CN': '用户 {} 创建',
                     'en': 'Create {}'}
    MsgExistUserError = {'zh-CN': '用户 {} 已存在',
                         'en': 'User {} already exists.'}
    MsgUserCheckUsername = {'zh-CN': '用户名只能包含英文字母和数字',
                            'en': 'Username can only contain English letters and numbers.'}
    MsgUserCheckPassword = {'zh-CN': '两个密码不一样，请重新输入',
                            'en': 'The two passwords are different, please re-enter.'}
    MsgModifyPwd = {'zh-CN': '{} 密码修改',
                    'en': '{} modify password'}
    MsgDownloadError = {'zh-CN': '文件下载失败，请重试',
                        'en': 'File download failed, please try again.'}
    MsgExportError1 = {'zh-CN': '请先选择文件或文件夹再导出',
                       'en': 'Please select the file or folder before exporting.'}
    MsgExportError2 = {'zh-CN': '暂时只支持一个文件夹导出',
                       'en': 'Only one folder export is supported.'}
    MsgExportError3 = {'zh-CN': '文件导出失败，请重试',
                       'en': 'File export failed, please try again.'}
    MsgVideoError = {'zh-CN': '播放视频失败，请重试',
                     'en': 'Failed to play video, please try again.'}
    MsgSSHExport = {'zh-CN': '请输入正确完整的文件绝对路径',
                    'en': 'Please enter the correct and complete absolute path.'}
    MsgFileTypeError = {'zh-CN': '不是标准的 {} 文件格式',
                        'en': 'Not standard {} format'}
    MsgSave = {'zh-CN': '{}保存',
               'en': '{} save'}
    MsgMove = {'zh-CN': '移动',
               'en': 'Move'}
    MsgUpload = {'zh-CN': '{} 上传',
                 'en': '{} upload'}
    MsgDownload = {'zh-CN': '{} 下载中',
                   'en': '{} downloading'}
    MsgCreate = {'zh-CN': '{} 创建',
                 'en': '{} create'}
    MsgFileExist = {'zh-CN': '{}已存在',
                    'en': '{} already exists.'}
    MsgFileNotExist = {'zh-CN': '{}不存在',
                       'en': '{} does not exist.'}
    MsgRename = {'zh-CN': '{} 重命名',
                 'en': '{} rename'}
    MsgRenameError = {'zh-CN': '名字重复，请重新输入 ~',
                      'en': 'The name is duplicated, please re-enter ~'}
    MsgDelete = {'zh-CN': '{} 删除',
                 'en': '{} delete'}
    MsgCopy = {'zh-CN': '{} 复制',
               'en': '{} copy'}
    MsgCopyName = {'zh-CN': '副本',
                   'en': 'copy'}
    MsgRestore = {'zh-CN': '{} 还原',
                  'en': '{} restore'}
    MsgExport = {'zh-CN': '{} 导出',
                 'en': '{} export'}
    MsgShare = {'zh-CN': '{} 分享',
                'en': '{} share'}
    MsgShareOpen = {'zh-CN': '分享链接打开',
                    'en': 'Open shared link'}
    MsgShareTimes = {'zh-CN': '分享链接打开次数太多',
                     'en': 'The shared link has been opened too many times'}
    MsgAccessPermissionNon = {'zh-CN': '未经授权的访问',
                              'en': 'Unauthorized access'}
