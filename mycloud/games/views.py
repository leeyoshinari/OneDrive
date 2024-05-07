#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import traceback
from mycloud import models
from common.results import Result
from common.messages import Msg
from common.logging import logger


async def get_rank(game_type: str, hh: dict) -> Result:
    result = Result()
    try:
        game = await models.Games.filter(type=game_type).order_by('-score')
        rank_list = [models.GamesRankInfo.from_orm(f).dict() for f in game]
        result.data = rank_list
        log_str = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        result.msg = hh['u']
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(log_str, game_type, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def set_score(query: models.GamesScoreInfo, hh: dict) -> Result:
    result = Result()
    try:
        game = await models.Games.filter(type=query.type, name=hh['u'])
        if game:
            if game[0].score < query.score:
                game[0].score = query.score
                await game[0].save()
            else:
                result.msg = f"{Msg.MsgGameScore[hh['lang']].format(Msg.Success[hh['lang']])}"
        else:
            _ = await models.Games.create(type=query.type, name=hh['u'], score=query.score)
        result.msg = f"{Msg.MsgGameScore[hh['lang']].format(Msg.Success[hh['lang']])}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, f'{query.type}-{query.score}',hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgGameScore[hh['lang']].format(Msg.Failure[hh['lang']])}"
        logger.error(traceback.format_exc())
    return result
