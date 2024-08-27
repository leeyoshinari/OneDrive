#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import traceback
from mycloud import models
from common.results import Result
from common.messages import Msg
from common.logging import logger


async def open_share_file(share_id: int, hh: dict) -> dict:
    try:
        share = await models.Shares.get(id=share_id)
        if share.total_times == 0 or share.times < share.total_times:
            share.times = share.times + 1
            await share.save()
            result = {'type': 0, 'path': share.path, 'name': share.name, 'format': share.format, 'file_id': share.file_id}
            logger.info(f"{share.name} - {Msg.MsgShareOpen[hh['lang']]}{Msg.Success[hh['lang']]}, Id: {share.id}, IP: {hh['ip']}")
        else:
            logger.warning(f"{share.name} - {Msg.MsgShareTimes[hh['lang']]}, Id: {share.id}, IP: {hh['ip']}")
            result = {'type': 404}
    except:
        logger.error(traceback.format_exc())
        result = {'type': 404}
    return result


async def get_share_file(hh: dict) -> Result:
    result = Result()
    try:
        files = await models.Shares.all().order_by('-create_time')
        result.data = [models.ShareFileList.from_orm_format(f).dict() for f in files]
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def delete_file(query: models.IsDelete, hh: dict) -> Result:
    result = Result()
    try:
        _ = await models.Shares.filter(id__in=query.ids).delete()
        result.msg = f"{Msg.MsgDelete[hh['lang']].format('')}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDelete[hh['lang']].format(query.ids) + Msg.Success[hh['lang']], query.ids, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgDelete[hh['lang']].format('')}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result
