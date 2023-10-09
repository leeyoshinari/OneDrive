#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

import os
import time
import json
import shutil
import traceback
from fastapi import FastAPI, APIRouter, Request, Response, Depends, HTTPException
from fastapi.responses import HTMLResponse
from tortoise import transactions
from tortoise.contrib.fastapi import register_tortoise
from mycloud import models
from mycloud import views
from mycloud.responses import StreamResponse
from common.calc import str_md5, beauty_size
from common.results import Result
from common.logging import logger
from common.messages import Msg
import settings


app = FastAPI()
TOKENs = {}
root_path = json.loads(settings.get_config("rootPath"))
router = APIRouter(prefix=settings.get_config("prefix"))
register_tortoise(app=app, config=settings.TORTOISE_ORM)


# 校验用户是否登陆，返回用户名
def auth(request: Request) -> dict:
    username = request.cookies.get("u", 's')
    token = request.cookies.get("token", None)
    if not username or username not in TOKENs or token != TOKENs[username]:
        raise HTTPException(status_code=401)
    return {'u': username, 'ip': request.headers.get('x-real-ip', '')}


def read_file(file_path):
    with open(file_path, 'rb') as f:
        while True:
            chunk = f.read(65536)
            if not chunk:
                break
            yield chunk


@router.get("/status", summary="获取用户登录状态")
async def get_status(request: Request):
    username = request.cookies.get("u", 's')
    token = request.cookies.get("token", None)
    if not username or username not in TOKENs or token != TOKENs[username]:
        return Result(code=-1)
    return Result()


@router.get("/user/test/createUser", summary="创建用户")
async def create_user(username: str, password: str, password1: str):
    result = Result()
    try:
        if not username.isalnum():
            result.code = 1
            result.msg = '用户名只能包含英文字母和数字'
            return result
        if password != password1:
            result.code = 1
            result.msg = "两个密码不一样，请重复输入"
            return result
        user = await models.User.filter(username=username.strip())
        if user:
            result.code = 1
            result.msg = Msg.MsgExistUserError.format(username)
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
            source_file = os.path.join(settings.path, 'web/img/pictures/undefined/back.jpg')
            target_file = os.path.join(back_path, 'back.jpg')
            shutil.copy(source_file, target_file)
        logger.info(Msg.MsgCreateUserSuccess.format(user.username))
        result.msg = Msg.MsgCreateUserSuccess.format(user.username)
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgCreateUserFailure.format(username)
    return result


@router.post("/user/modify/pwd", summary="修改用户密码")
async def modify_pwd(query: models.CreateUser, hh: dict = Depends(auth)):
    result = Result()
    try:
        if query.password != query.password1:
            result.code = 1
            result.msg = "两个密码不一样，请重复输入"
            return result
        user = await models.User.get(username=query.username)
        user.password = str_md5(query.password)
        await user.save()
        logger.info(f"{Msg.MsgModifyPwdSuccess.format(user.username)}, IP: {hh['ip']}")
        result.msg = Msg.MsgModifyPwdSuccess.format(user.username)
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgModifyPwdFailure.format(query.username)
    return result


@router.post("/login", summary="用户登陆")
async def login(query: models.UserBase, response: Response):
    result = Result()
    try:
        user = await models.User.get(username=query.username, password=str_md5(query.password))
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
            response.set_cookie('t', str(int(time.time() * 1000)))
            response.set_cookie('token', token)
            logger.info(f'{Msg.MsgLoginSuccess.format(query.username)}')
            result.msg = Msg.MsgLoginSuccess.format(user.username)
        else:
            logger.error(f'{Msg.MsgLoginFailure}')
            result.code = 1
            result.msg = Msg.MsgLoginFailure
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgLoginFailure
    return result


@router.get("/logout", summary="退出登陆")
async def logout(hh: dict = Depends(auth)):
    TOKENs.pop(hh['u'], 0)
    logger.info(f'{Msg.MsgLogoutSuccess.format(hh["u"])}, IP: {hh["ip"]}')
    return Result()


@router.get("/disk/get", summary="获取磁盘空间使用数据")
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
        logger.info(f"查询磁盘信息成功, 用户: {hh['u']}, IP: {hh['ip']}")
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = "查询磁盘信息失败"
    return result


@router.get('/folder/get/{file_id}', summary="查询当前目录下所有的文件夹")
async def get_folder_name(file_id: str, hh: dict = Depends(auth)):
    result = await views.get_folders_by_id(file_id, hh)
    return result


@router.get("/file/get/{file_id}", summary="查询当前目录下所有文件夹和文件")
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


@router.post('/create', summary="新建文件夹 或 txt文件")
async def create_folder(query: models.CatalogBase, hh: dict = Depends(auth)):
    if query.type == 'folder':
        result = await views.create_folder(query.id, hh)
    else:
        result = await views.create_file(query.id, hh)
    return result


@router.post("/rename", summary="重命名文件、文件夹")
async def rename_file(query: models.FilesBase, hh: dict = Depends(auth)):
    if query.type == 'folder':
        result = await views.rename_folder(query, hh)
    else:
        result = await views.rename_file(query, hh)
    return result


@router.get("/content/get/{file_id}", summary="获取文本文件的内容")
async def get_file(file_id: str, hh: dict = Depends(auth)):
    result = await views.get_file_by_id(file_id, hh)
    return result


@router.post("/file/save", summary="保存文本文件")
async def save_file(query: models.SaveFile, hh: dict = Depends(auth)):
    result = await views.save_txt_file(query, hh)
    return result


@router.get("/file/download/{file_id}", summary="下载文件")
async def download_file(file_id: str, hh: dict = Depends(auth)):
    try:
        result = await views.download_file(file_id, hh)
        headers = {'Accept-Ranges': 'bytes', 'Content-Length': str(os.path.getsize(result['path'])),
                   'Content-Disposition': f'inline;filename="{result["name"]}"'}
        return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg="文件下载失败，请重试")


@router.post("/file/export", summary="导出多个文件, 或单个文件夹下的所有文件")
async def zip_file(query: models.DownloadFile, hh: dict = Depends(auth)):
    try:
        if len(query.ids) == 0:
            return Result(code=1, msg="请先选择文件或文件夹再导出")
        if query.file_type == 'folder' and len(query.ids) > 1:
            return Result(code=1, msg="暂时只支持一个文件夹导出")
        return await views.zip_file(query, hh)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg="文件导出失败，请重试")


@router.post("/file/share", summary="分享文件")
async def share_file(query: models.ShareFile, hh: dict = Depends(auth)):
    result = await views.share_file(query, hh)
    return result


@router.get("/share/list", summary="分享文件列表")
async def get_share_list(hh: dict = Depends(auth)):
    result = await views.get_share_file(hh)
    return result


@router.get("/share/get/{file_id}", summary="打开文件分享链接")
async def get_share_file(file_id: int, request: Request):
    try:
        hh = {'ip': request.headers.get('x-real-ip', '')}
        result = await views.open_share_file(file_id, hh)
        if result['type'] == 0:
            headers = {'Content-Disposition': f'inline;filename="{result["name"]}"', 'Cache-Control': 'no-store'}
            return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
        else:
            return HTMLResponse(status_code=404, content=settings.HTML404)
    except:
        logger.error(traceback.format_exc())
        return HTMLResponse(content=settings.HTML404)


@router.post("/move", summary="移动文件/文件夹")
async def move_to_folder(query: models.CatalogMoveTo, hh: dict = Depends(auth)):
    result = await views.move_to_folder(query, hh)
    return result


@router.post("/delete", summary="删除文件/文件夹")
async def delete_file(query: models.IsDelete, hh: dict = Depends(auth)):
    result = await views.delete_file(query, hh)
    return result


@router.post("/file/import", summary="服务器本地文件直接导入")
async def import_file(query: models.ImportLocalFileByPath):
    result = await views.upload_file_by_path(query)
    return result


@router.post("/file/upload", summary="上传文件")
async def upload_file(query: Request, hh: dict = Depends(auth)):
    result = await views.upload_file(query, hh)
    return result


@router.post("/img/upload", summary="上传背景图片")
async def upload_image(query: Request, hh: dict = Depends(auth)):
    result = await views.upload_image(query, hh)
    return result


app.include_router(router)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host=settings.get_config('host'), port=int(settings.get_config('port')), reload=False)
