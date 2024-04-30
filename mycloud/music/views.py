#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari
import os
import traceback
import eyed3
from tortoise.expressions import Q
from tortoise.exceptions import DoesNotExist
from mycloud import models
from common.results import Result
from common.messages import Msg
from common.logging import logger
from common.calc import beauty_mp3_time


async def get_mp3_info(file_id: str, hh: dict) -> Result:
    result = Result()
    try:
        file = await models.Files.get(id=file_id).select_related('parent')
        parent_path = await file.parent.get_all_path()
        file_path = os.path.join(parent_path, file.name)
        mp3_info = eyed3.load(file_path)
        result.data = {'id': file.id, 'name': file.name, 'duration': beauty_mp3_time(mp3_info.info.time_secs)}
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_all_mp3(folder_id, hh: dict) -> Result:
    result = Result()
    try:
        music_list = await models.Files.filter(Q(parent_id=folder_id) & Q(format='mp3') & Q(is_delete=0)).select_related('parent').order_by('-id')
        file_list = []
        for f in music_list:
            parent_path = await f.parent.get_all_path()
            file_path = os.path.join(parent_path, f.name)
            mp3_info = eyed3.load(file_path)
            file_list.append(models.MP3List.from_orm_format(f, beauty_mp3_time(mp3_info.info.time_secs)).dict())
        result.data = file_list
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, folder_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_mp3_history(order_by: str, hh: dict) -> Result:
    result = Result()
    try:
        page_size = 200
        if order_by == '-times':
            page_size = 100
        music_list = await models.Musics.filter(username=hh['u']).order_by(order_by).limit(page_size)
        file_list = [models.MusicList.from_orm_format(f).dict() for f in music_list]
        result.data = file_list
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def set_mp3_history(query: models.MusicHistory, hh: dict) -> Result:
    result = Result()
    try:
        try:
            mp3 = await models.Musics.get(file_id=query.file_id)
            mp3.times = mp3.times + 1
            await mp3.save()
        except DoesNotExist:
            _ = await models.Musics.create(file_id=query.file_id, name=query.name, singer=query.singer, duration=query.duration, username=hh['u'])
        result.msg = f"{Msg.MsgMusicRecord[hh['lang']].format(query.name)}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, query.file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def delete_mp3_history(file_id, hh: dict) -> Result:
    result = Result()
    try:
        try:
            mp3 = await models.Musics.get(file_id=file_id)
            await mp3.delete()
        except DoesNotExist:
            pass
        result.msg = f"{Msg.MsgDelete[hh['lang']].format(file_id)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgDelete[hh['lang']].format(file_id)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_mp3_lyric(file_id: str, hh: dict) -> Result:
    result = Result()
    try:
        mp3_file = await models.Files.get(id=file_id).select_related('parent')
        parent_path = await mp3_file.parent.get_all_path()
        lrc_file_name = mp3_file.name.replace('mp3', 'lrc')
        lrc_file_path = os.path.join(parent_path, lrc_file_name)
        if os.path.exists(lrc_file_path):
            with open(lrc_file_path, 'rb') as f:
                result.data = f.read()
            result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
            logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
        else:
            result.code = 1
            result.msg = f"{Msg.MsgFileNotExist[hh['lang']].format(lrc_file_name)}"
            logger.error(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result
