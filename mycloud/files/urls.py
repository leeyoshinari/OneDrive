#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

import os
import traceback
from fastapi import APIRouter, Request, Depends
from mycloud import models
from mycloud.files import views
from mycloud.auth_middleware import auth, auth_url
from mycloud.responses import StreamResponse, MyResponse
from common.results import Result
from common.logging import logger
from common.messages import Msg
import settings


router = APIRouter(prefix='/file', tags=['file (文件)'], responses={404: {'description': 'Not found'}})


async def read_file(file_path, start_index=0):
    with open(file_path, 'rb') as f:
        f.seek(start_index)
        while True:
            chunk = f.read(65536)
            if not chunk:
                break
            yield chunk


@router.get("/get/{file_id}", summary="Query all files and folders in the current directory (查询当前目录下所有文件夹和文件)")
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


@router.post('/create', summary="Create new folder or new file (新建文件)")
async def create_file(query: models.CatalogBase, hh: dict = Depends(auth)):
    result = await views.create_file(query.id, query.file_type, hh)
    return result


@router.post("/rename", summary="Rename folder or file (重命名文件)")
async def rename_file(query: models.FilesBase, hh: dict = Depends(auth)):
    result = await views.rename_file(query, hh)
    return result


@router.get("/content/{file_id}", summary="Get content of a file (获取文本文件的内容)")
async def get_file(file_id: str, hh: dict = Depends(auth)):
    result = await views.get_file_by_id(file_id, hh)
    return result


@router.post("/save", summary="Save content to file (保存文本文件)")
async def save_file(query: models.SaveFile, hh: dict = Depends(auth)):
    result = await views.save_txt_file(query, hh)
    return result


@router.get("/copy/{file_id}", summary="Copy file (复制文件)")
async def copy_file(file_id: str, hh: dict = Depends(auth)):
    result = await views.copy_file(file_id, hh)
    return result


@router.get("/download/{file_id}", summary="Download file (下载文件)")
async def download_file(file_id: str, hh: dict = Depends(auth)):
    try:
        result = await views.download_file(file_id, hh)
        headers = {'Accept-Ranges': 'bytes', 'Content-Length': str(os.path.getsize(result['path'])),
                   'Content-Disposition': f'inline;filename="{result["name"]}"'}
        return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.MsgDownloadError[hh['lang']])


@router.get("/onlyoffice/{file_id}", summary="Download office file (下载 onlyoffice 文件)")
async def onlyoffice_file(file_id: str, hh: dict = Depends(auth_url)):
    try:
        result = await views.download_file(file_id, hh)
        headers = {'Accept-Ranges': 'bytes', 'Content-Length': str(os.path.getsize(result['path'])),
                   'Content-Disposition': f'inline;filename="{result["name"]}"'}
        return StreamResponse(read_file(result['path']), media_type=settings.CONTENT_TYPE.get(result["format"], 'application/octet-stream'), headers=headers)
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.MsgDownloadError[hh['lang']])


@router.post("/export", summary="Export multiple files (导出多个文件, 或单个文件夹下的所有文件)")
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


@router.post("/move", summary="Move file (移动文件)")
async def move_to_folder(query: models.CatalogMoveTo, hh: dict = Depends(auth)):
    result = await views.move_to_folder(query, hh)
    return result


@router.post("/import", summary="Import files from local file in server (服务器本地文件直接导入，无登录校验)")
async def import_file(query: models.ImportLocalFileByPath, hh: dict = Depends(auth)):
    result = await views.upload_file_by_path(query, hh)
    return result


@router.post("/upload", summary="Upload files (上传文件)")
async def upload_file(query: Request, hh: dict = Depends(auth)):
    result = await views.upload_file(query, hh)
    return result


@router.post("/uploadImage", summary="Upload background image (上传背景图片)")
async def upload_image(query: Request, hh: dict = Depends(auth)):
    result = await views.upload_image(query, hh)
    return result


@router.post("/share", summary="Share file (分享文件)")
async def share_file(query: models.ShareFile, hh: dict = Depends(auth)):
    result = await views.share_file(query, hh)
    return result


@router.get("/playVideo/{file_id}", summary="Play video (播放视频)")
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


@router.get("/export/xmind/{file_id}", summary="Export xmind file (导出 xmind 文件)")
async def export_file(file_id: str, hh: dict = Depends(auth)):
    try:
        result = await views.export_xmind_file(file_id, hh)
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
