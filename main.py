#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

import os
import time
import json
import shutil
import traceback
from fastapi import FastAPI, APIRouter, Request, Response, Depends, HTTPException, WebSocket
from fastapi.responses import HTMLResponse
from tortoise import transactions
from tortoise.exceptions import DoesNotExist
from tortoise.contrib.fastapi import register_tortoise
from mycloud import models
from mycloud import views
from mycloud.responses import StreamResponse, MyResponse
from common.calc import str_md5, beauty_size, modify_prefix, parse_pwd
from common.results import Result
from common.logging import logger
from common.messages import Msg
from common.xmind import read_xmind, generate_xmind8
from common.sheet import read_sheet
import common.scheduler
import starlette.websockets
from common.websocket import WebSSH
import settings


app = FastAPI()
TOKENs = {}
root_path = json.loads(settings.get_config("rootPath"))
router = APIRouter(prefix=settings.get_config("prefix"))
register_tortoise(app=app, config=settings.TORTOISE_ORM)
modify_prefix(settings.get_config("prefix"))


# 校验用户是否登陆，返回用户名
def auth(request: Request) -> dict:
    username = request.cookies.get("u", 's')
    lang = request.headers.get('lang', 'en')
    ip = request.headers.get('x-real-ip', '')
    token = request.cookies.get("token", None)
    if not username or username not in TOKENs or token != TOKENs[username]:
        raise HTTPException(status_code=401)
    return {'u': username, 'ip': ip, 'lang': lang}


async def read_file(file_path, start_index=0):
    with open(file_path, 'rb') as f:
        f.seek(start_index)
        while True:
            chunk = f.read(65536)
            if not chunk:
                break
            yield chunk


@router.get("/status", summary="Get login status (获取用户登录状态)")
async def get_status(request: Request):
    username = request.cookies.get("u", 's')
    token = request.cookies.get("token", None)
    if not username or username not in TOKENs or token != TOKENs[username]:
        return Result(code=-1)
    return Result()


@router.get("/user/test/createUser", summary="Create user (创建用户)")
async def create_user(username: str, password: str, password1: str, request: Request):
    result = Result()
    lang = request.headers.get('lang', 'en')
    try:
        if not username.isalnum():
            result.code = 1
            result.msg = Msg.MsgUserCheckUsername[lang]
            return result
        if password != password1:
            result.code = 1
            result.msg = Msg.MsgUserCheckPassword[lang]
            return result
        user = await models.User.filter(username=username.strip())
        if user:
            result.code = 1
            result.msg = f"{Msg.MsgExistUserError[lang].format(username)}"
            logger.error(f"{result.msg}, IP: {request.headers.get('x-real-ip', '')}")
            return result
        async with transactions.in_transaction():
            password = str_md5(password)
            user = await models.User.create(username=username, password=password)
            for k, v in root_path.items():
                folder = await models.Catalog.filter(id=k)
                if not folder:
                    await models.Catalog.create(id=k, parent=None, name=v)
                folder = await models.Catalog.filter(id=f"{k}{user.username}")
                if not folder:
                    await models.Catalog.create(id=f"{k}{user.username}", name=user.username, parent_id=k)
                user_path = os.path.join(v, user.username)
                if not os.path.exists(user_path):
                    os.mkdir(user_path)
            back_path = os.path.join(settings.path, 'web/img/pictures', user.username)
            if not os.path.exists(back_path):
                os.mkdir(back_path)
            source_file = os.path.join(settings.path, 'web/img/pictures/undefined/background.jpg')
            target_file = os.path.join(back_path, 'background.jpg')
            shutil.copy(source_file, target_file)
        result.msg = f"{Msg.MsgCreateUser[lang].format(user.username)}{Msg.Success[lang]}"
        logger.info(f"{result.msg}, IP: {request.headers.get('x-real-ip', '')}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgCreateUser[lang].format(username)}{Msg.Failure[lang]}"
        logger.error(traceback.format_exc())
    return result


@router.post("/user/modify/pwd", summary="Modify password (修改用户密码)")
async def modify_pwd(query: models.CreateUser, hh: dict = Depends(auth)):
    result = Result()
    try:
        if query.password != query.password1:
            result.code = 1
            result.msg = Msg.MsgUserCheckPassword[hh['lang']]
            return result
        user = await models.User.get(username=query.username)
        user.password = str_md5(parse_pwd(query.password, query.t))
        await user.save()
        result.msg = f"{Msg.MsgModifyPwd[hh['lang']].format(user.username)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgModifyPwd[hh['lang']].format(query.username)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


@router.post("/login", summary="Login (用户登陆)")
async def login(query: models.UserBase, request: Request, response: Response):
    result = Result()
    lang = request.headers.get('lang', 'en')
    try:
        user = await models.User.get(username=query.username, password=str_md5(parse_pwd(query.password, query.t)))
        if user:
            for k, v in root_path.items():
                folder = await models.Catalog.filter(id=k)
                if not folder:
                    await models.Catalog.create(id=k, parent=None, name=v)
                folder = await models.Catalog.filter(id=f"{k}{user.username}")
                if not folder:
                    await models.Catalog.create(id=f"{k}{user.username}", name=user.username, parent_id=k)
                user_path = os.path.join(v, user.username)
                if not os.path.exists(user_path):
                    os.mkdir(user_path)
            pwd_str = f'{time.time()}_{user.username}_{int(time.time())}'
            token = str_md5(pwd_str)
            TOKENs.update({user.username: token})
            response.set_cookie('u', user.username)
            response.set_cookie('t', str(int(time.time() / 1000)))
            response.set_cookie('token', token)
            result.msg = f"{Msg.MsgLogin[lang].format(user.username)}{Msg.Success[lang]}"
            logger.info(f"{result.msg}, IP: {request.headers.get('x-real-ip', '')}")
        else:
            result.code = 1
            result.msg = f"{Msg.MsgLoginUserOrPwdError[lang]}"
            logger.error(f"{result.msg}, IP: {request.headers.get('x-real-ip', '')}")
    except DoesNotExist:
        result.code = 1
        result.msg = f"{Msg.MsgLoginUserOrPwdError[lang]}"
        logger.error(f"{result.msg}, IP: {request.headers.get('x-real-ip', '')}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgLogin[lang].format(query.username)}{Msg.Failure[lang]}"
        logger.error(traceback.format_exc())
    return result


@router.get("/logout", summary="Logout (退出登陆)")
async def logout(hh: dict = Depends(auth)):
    TOKENs.pop(hh['u'], 0)
    logger.info(f"{Msg.MsgLogout[hh['lang']].format(hh['u'])}{Msg.Success[hh['lang']]}, IP: {hh['ip']}")
    return Result()


@router.get("/disk/get", summary="Get disk usage (获取磁盘空间使用数据)")
async def get_disk_usage(hh: dict = Depends(auth)):
    result = Result()
    try:
        data = []
        for k, v in root_path.items():
            info = shutil.disk_usage(v)
            data.append({'disk': k, 'total': beauty_size(info.total), 'free': beauty_size(info.free),
                         'used': round(info.used / info.total * 100, 2)})
        result.data = data
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


@router.get('/folder/get/{file_id}', summary="Query all folders in the current directory (查询当前目录下所有的文件夹)")
async def get_folder_name(file_id: str, hh: dict = Depends(auth)):
    result = await views.get_folders_by_id(file_id, hh)
    return result


@router.get("/file/get/{file_id}", summary="Query all files and folders in the current directory (查询当前目录下所有文件夹和文件)")
async def query_files(file_id: str, q: str = "", sort_field: str = 'update_time', sort_type: str = 'desc',
                      page: int = 1, page_size: int = 20, hh: dict = Depends(auth)):
    query = models.SearchItems()
    query.q = q
    query.sort_field = sort_field
    query.sort_type = sort_type
    query.page = page
    query.page_size = page_size
    result = await views.get_all_files(file_id, query, hh)
    return result


@router.post('/create', summary="Create new folder or new file (新建文件夹 或 文件)")
async def create_folder(query: models.CatalogBase, hh: dict = Depends(auth)):
    if query.type == 'folder':
        result = await views.create_folder(query.id, hh)
    else:
        result = await views.create_file(query.id, query.file_type, hh)
    return result


@router.post("/rename", summary="Rename folder or file (重命名文件、文件夹)")
async def rename_file(query: models.FilesBase, hh: dict = Depends(auth)):
    if query.type == 'folder':
        result = await views.rename_folder(query, hh)
    else:
        result = await views.rename_file(query, hh)
    return result


@router.get("/content/get/{file_id}", summary="Get content of a file (获取文本文件的内容)")
async def get_file(file_id: str, hh: dict = Depends(auth)):
    result = await views.get_file_by_id(file_id, hh)
    return result


@router.post("/file/save", summary="Save content to file (保存文本文件)")
async def save_file(query: models.SaveFile, hh: dict = Depends(auth)):
    result = await views.save_txt_file(query, hh)
    return result


@router.get("/file/copy/{file_id}", summary="Copy file (复制文件)")
async def copy_file(file_id: str, hh: dict = Depends(auth)):
    result = await views.copy_file(file_id, hh)
    return result


@router.get("/file/download/{file_id}", summary="Download file (下载文件)")
async def download_file(file_id: str, hh: dict = Depends(auth)):
    try:
        result = await views.download_file(file_id, hh)
        headers = {'Accept-Ranges': 'bytes', 'Content-Length': str(os.path.getsize(result['path'])),
                   'Content-Disposition': f'inline;filename="{result["name"]}"'}
        return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.MsgDownloadError[hh['lang']])


@router.post("/file/export", summary="Export multiple files (导出多个文件, 或单个文件夹下的所有文件)")
async def zip_file(query: models.DownloadFile, hh: dict = Depends(auth)):
    try:
        if len(query.ids) == 0:
            return Result(code=1, msg=Msg.MsgExportError1[hh['lang']])
        if query.file_type == 'folder' and len(query.ids) > 1:
            return Result(code=1, msg=Msg.MsgExportError2[hh['lang']])
        return await views.zip_file(query, hh)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.MsgExportError3[hh['lang']])


@router.get("/video/play/{file_id}", summary="Play video (播放视频)")
async def play_video(file_id: str, request: Request, hh: dict = Depends(auth)):
    try:
        result = await views.download_file(file_id, hh)
        header_range = request.headers.get('range', '0-')
        start_index = int(header_range.strip('bytes=').split('-')[0])
        file_size = os.path.getsize(result['path'])
        content_range = f"bytes {start_index}-{file_size-1}/{file_size}"
        headers = {'Accept-Ranges': 'bytes', 'Content-Length': str(file_size - start_index),
                   'Content-Range': content_range, 'Content-Disposition': f'inline;filename="{result["name"]}"'}
        return StreamResponse(read_file(result['path'], start_index=start_index), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers, status_code=206)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.MsgVideoError[hh['lang']])


@router.post("/file/share", summary="Share file (分享文件)")
async def share_file(query: models.ShareFile, hh: dict = Depends(auth)):
    result = await views.share_file(query, hh)
    return result


@router.get("/share/list", summary="Share file list (分享文件列表)")
async def get_share_list(hh: dict = Depends(auth)):
    result = await views.get_share_file(hh)
    return result


@router.get("/share/get/{file_id}", summary="Open share link (打开文件分享链接)")
async def get_share_file(file_id: int, request: Request):
    try:
        hh = {'ip': request.headers.get('x-real-ip', ''), 'lang': request.headers.get('lang', 'en')}
        result = await views.open_share_file(file_id, hh)
        if result['type'] == 0:
            if result["format"] in ['md', 'docu', 'py']:
                res = Result()
                with open(result['path'], 'r', encoding='utf-8') as f:
                    res.data = f.read()
                res.msg = result['name']
                return res
            if result["format"] == 'xmind':
                res = Result()
                xmind = read_xmind(result['path'])
                res.data = xmind
                res.msg = result['name']
                return res
            if result["format"] == 'sheet':
                res = Result()
                sheet = read_sheet(result['path'])
                res.data = sheet
                res.msg = result['name']
                return res
            else:
                if os.path.exists(result['path']):
                    headers = {'Content-Disposition': f'inline;filename="{result["name"]}"', 'Cache-Control': 'no-store'}
                    return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
                else:
                    return HTMLResponse(status_code=404, content=settings.HTML404)
        else:
            return HTMLResponse(status_code=404, content=settings.HTML404)
    except:
        logger.error(traceback.format_exc())
        return HTMLResponse(status_code=404, content=settings.HTML404)


@router.post("/move", summary="Move file/folder (移动文件/文件夹)")
async def move_to_folder(query: models.CatalogMoveTo, hh: dict = Depends(auth)):
    result = await views.move_to_folder(query, hh)
    return result


@router.post("/delete", summary="Delete file/folder (删除文件/文件夹)")
async def delete_file(query: models.IsDelete, hh: dict = Depends(auth)):
    result = await views.delete_file(query, hh)
    return result


@router.post("/file/import", summary="Import files from local file in server (服务器本地文件直接导入，无登录校验)")
async def import_file(query: models.ImportLocalFileByPath, hh: dict = Depends(auth)):
    result = await views.upload_file_by_path(query, hh)
    return result


@router.post("/file/upload", summary="Upload files (上传文件)")
async def upload_file(query: Request, hh: dict = Depends(auth)):
    result = await views.upload_file(query, hh)
    return result


@router.post("/img/upload", summary="Upload background image (上传背景图片)")
async def upload_image(query: Request, hh: dict = Depends(auth)):
    result = await views.upload_image(query, hh)
    return result


@router.get("/export/{file_id}", summary="Export xmind file (导出 xmind 文件)")
async def export_file(file_id: str, hh: dict = Depends(auth)):
    try:
        result = await views.export_special_file(file_id, hh)
        headers = {'Accept-Ranges': 'bytes', 'Content-Length': str(os.path.getsize(result['path'])),
                   'Content-Disposition': f'inline;filename="{result["name"]}"'}
        return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.MsgDownloadError[hh['lang']])


@router.get("/export/md/{file_id}", summary="Export markdown to html (导出 markdown 转 html)")
async def md2html(file_id: str, hh: dict = Depends(auth)):
    try:
        result = await views.markdown_to_html(file_id, hh)
        headers = {'Accept-Ranges': 'bytes', 'Content-Disposition': f'inline;filename="{result["name"]}"'}
        return MyResponse(result['data'].encode('utf-8'), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.Failure[hh['lang']])


@router.get("/share/export/{file_id}", summary="Export file (导出文件)")
async def export_share_file(file_id: int, request: Request):
    try:
        hh = {'ip': request.headers.get('x-real-ip', '')}
        result = await views.open_share_file(file_id, hh)
        if result['type'] == 0:
            if result["format"] == 'xmind':
                file_path = generate_xmind8(result['file_id'], result['name'], result['path'])
                result['path'] = file_path
            headers = {'Accept-Ranges': 'bytes', 'Content-Length': str(os.path.getsize(result['path'])),
                       'Content-Disposition': f'inline;filename="{result["name"]}"'}
            return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
        else:
            return HTMLResponse(status_code=404, content=settings.HTML404)
    except:
        logger.error(traceback.format_exc())
        return HTMLResponse(status_code=404, content=settings.HTML404)


@router.post("/server/add", summary="Add server (添加服务器)")
async def add_server(query: models.ServerModel, hh: dict = Depends(auth)):
    result = await views.save_server(query, hh)
    return result


@router.get("/server/delete/{server_id}", summary="Delete server (删除服务器)")
async def delete_server(server_id: str, hh: dict = Depends(auth)):
    result = await views.delete_server(server_id, hh)
    return result


@router.get("/server/get", summary="Get server list (获取服务器列表)")
async def get_server(hh: dict = Depends(auth)):
    result = await views.get_server(hh)
    return result


@router.post("/ssh/file/upload", summary="Upload file (上传文件)")
async def upload_file_to_ssh(query: Request, hh: dict = Depends(auth)):
    result = await views.upload_file_to_linux(query, hh)
    return result


@router.get("/ssh/file/download", summary="Download file (下载文件)")
async def download_file_from_ssh(server_id: str, file_path: str, hh: dict = Depends(auth)):
    _, file_name = os.path.split(file_path)
    if not file_name:
        logger.error(f"{Msg.CommonLog[hh['lang']].format(Msg.MsgSSHExport[hh['lang']], hh['u'], hh['ip'])}")
        return Result(code=1, msg=Msg.MsgSSHExport[hh['lang']])
    fp = await views.download_file_from_linux(server_id, file_path, hh)
    headers = {'Accept-Ranges': 'bytes', 'Content-Disposition': f'inline;filename="{file_name}"'}
    return StreamResponse(fp, media_type='application/octet-stream', headers=headers)


@router.get("/music/info/get/{file_id}", summary="get music meta info (音乐的信息)")
async def get_music_info(file_id: str, hh: dict = Depends(auth)):
    result = await views.get_mp3_info(file_id, hh)
    return result


@router.get("/music/get/{folder_id}", summary="query music list from folder (从文件夹中查询音乐)")
async def get_music_from_folder(folder_id: str, hh: dict = Depends(auth)):
    result = await views.get_all_mp3(folder_id, hh)
    return result


@router.get("/music/history/get/{flag}", summary="query music history list (查询播放历史列表)")
async def get_music_history_list(flag: int = 1, hh: dict = Depends(auth)):
    order_by = '-update_time'
    if flag == 2: order_by = '-times'
    result = await views.get_mp3_history(order_by, hh)
    return result


@router.get("/music/history/delete/{file_id}", summary="delete music history (删除播放历史记录)")
async def get_music_history_list(file_id: str, hh: dict = Depends(auth)):
    result = await views.delete_mp3_history(file_id, hh)
    return result


@router.post("/music/record/set", summary="Record playing music (记录播放的音乐)")
async def set_music_record(query: models.MusicHistory, hh: dict = Depends(auth)):
    result = await views.set_mp3_history(query, hh)
    return result


@router.get("/music/lyric/get/{file_id}", summary="query music lyric (根据歌曲查歌词)")
async def get_music_lyric(file_id: str, hh: dict = Depends(auth)):
    result = await views.get_mp3_lyric(file_id, hh)
    return result


@router.websocket('/ssh/open')
async def shell_ssh(websocket: WebSocket):
    await websocket.accept()
    ws = WebSSH(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws.receive(data)
    except starlette.websockets.WebSocketDisconnect:
        logger.info(f"websocket disconnected.")
    except RuntimeError as err:
        logger.info(f"websocket disconnected.")
    except:
        logger.error(traceback.format_exc())
    finally:
        await ws.disconnect()


app.include_router(router)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host=settings.get_config('host'), port=int(settings.get_config('port')), reload=False)
