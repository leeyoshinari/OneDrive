#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari
import os
import time
import asyncio
import threading
import traceback
from mycloud import models
from common.results import Result
from common.messages import Msg
from common.logging import logger
from common.calc import calc_file_md5
from common.aria2c import Aria2Downloader


aria2c_downloader = Aria2Downloader()


async def get_download_list(hh: dict) -> Result:
    result = Result()
    try:
        if not aria2c_downloader.process:
            result.data = []
            return result
        file_lists = aria2c_downloader.list_download_tasks()
        download_list = [models.DownloadList.from_orm_format(d).dict() for d in file_lists]
        result.data = download_list
        result.total = len(download_list)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def download_with_aria2c(query: models.DownloadFileOnline, hh: dict) -> Result:
    result = Result()
    try:
        folder_id = query.parent_id
        if len(folder_id) == 1:
            folder_id = folder_id + hh['u']
        if len(folder_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
            return result
        folder = await models.Catalog.get(id=folder_id)
        folder_path = await folder.get_all_path()
        gid = aria2c_downloader.add_download_task(query.url, folder_path, query.cookie)
        res = aria2c_downloader.get_completed_task_info(gid)
        logger.info(res)
        start_time = time.time()
        while int(res['downloadSpeed']) < 1:
            if 'errorCode' in res:
                if res['status'] == 'complete':
                    file_path = res['files'][0]['path']
                    result.msg = f"{Msg.MsgFileExist[hh['lang']].format(file_path.split('/')[-1])}"
                    logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, query.url, hh['u'], hh['ip'])}")
                    aria2c_downloader.close_aria2c_downloader()
                    return result
                if res['errorCode'] == '1' and not res['files'][0]['path'] and not res['files'][0]['uris']:
                    result.code = 1
                    result.msg = f"{Msg.MsgDownloadOnlineProtocol[hh['lang']]}"
                    logger.error(f"{Msg.CommonLog1[hh['lang']].format(res, query.url, hh['u'], hh['ip'])}")
                    aria2c_downloader.close_aria2c_downloader()
                    return result
                result.code = 1
                result.msg = res['errorMessage']
                logger.error(f"{Msg.CommonLog1[hh['lang']].format(res, query.url, hh['u'], hh['ip'])}")
                aria2c_downloader.close_aria2c_downloader()
                return result
            else:
                if time.time() - start_time > 30:
                    result.code = 1
                    result.msg = f"{Msg.MsgDownloadOnlineProtocol[hh['lang']]}"
                    logger.error(f"{Msg.CommonLog1[hh['lang']].format(result.msg, query.url, hh['u'], hh['ip'])}")
                    _ = aria2c_downloader.update_task(gid, 'cancel')
                    aria2c_downloader.close_aria2c_downloader()
                    return result
                time.sleep(1)
                res = aria2c_downloader.get_completed_task_info(gid)
        threading.Thread(target=run_async_write_aria2c_to_db, args=(gid, folder_id, )).start()
        result.msg = f"{Msg.MsgDownloadOnline[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(query.url, gid, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgDownloadError[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


def run_async_write_aria2c_to_db(gid, parent_id):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(write_aria2c_task_to_db(gid, parent_id))
    except:
        logger.error(traceback.format_exc())
    finally:
        loop.close()


async def write_aria2c_task_to_db(gid, parent_id):
    while True:
        res = aria2c_downloader.get_completed_task_info(gid)
        if res and res['status'] == 'complete':
            file_path = res['files'][0]['path']
            file_name = file_path.split('/')[-1]
            file = await models.Files.create(id=str(int(time.time() * 10000)), name=file_name,
                                             format=file_name.split(".")[-1].lower(), parent_id=parent_id,
                                             size=os.path.getsize(file_path), md5=calc_file_md5(file_path))
            logger.info(f"{file.id} - {file.name}")
            time.sleep(3)
            aria2c_downloader.close_aria2c_downloader()
            break
        elif res and res['status'] == 'removed':
            logger.info(f"{Msg.MsgDownloadOnlineRemove['en'].format('gid: ' + res['gid'] + ', file: ' + res['files'][0]['path'])}")
            break
        elif not res:
            logger.info(f"{res}")
            break
        else:
            logger.info(f"{res['gid']} - {res['status']} - {res['files'][0]['path']}")
            time.sleep(1)


async def update_area2c_task_status(query: models.DownloadFileOnlineStatus, hh: dict) -> Result:
    result = Result()
    try:
        if query.status == 'cancel':
            res = aria2c_downloader.get_completed_task_info(query.gid)
            logger.info(res)
            file_path = res['files'][0]['path']
        res = aria2c_downloader.update_task(query.gid, query.status)
        if query.status == 'cancel':
            time.sleep(1)
            os.remove(file_path)
            os.remove(file_path + '.aria2')
            aria2c_downloader.close_aria2c_downloader()
        result.data = res
        result.msg = f"{Msg.MsgUpdateStatus[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, query.gid, hh['u'], hh['ip'])}")
    except:
        logger.error(traceback.format_exc())
    return result
