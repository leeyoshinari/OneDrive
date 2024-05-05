#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

from fastapi import APIRouter, Depends
from mycloud import models
from mycloud.downloader import views
from mycloud.auth_middleware import auth


router = APIRouter(prefix='/download', tags=['downloader (下载器)'], responses={404: {'description': 'Not found'}})


@router.get("/list", summary="Download file list (文件下载列表)")
async def download_list_with_aria2c(hh: dict = Depends(auth)):
    result = await views.get_download_list(hh)
    return result


@router.post("/file", summary="Download file (下载文件)")
async def download_file_with_aria2c(query: models.DownloadFileOnline, hh: dict = Depends(auth)):
    result = await views.download_with_aria2c(query, hh)
    return result


@router.post("/status/update", summary="update download task status (更新下载任务的状态)")
async def update_aria2c_status(query: models.DownloadFileOnlineStatus, hh: dict = Depends(auth)):
    result = await views.update_area2c_task_status(query, hh)
    return result
