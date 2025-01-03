#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

from fastapi import Request, HTTPException
import settings
from mycloud.models import SessionBase


# 校验用户是否登陆，返回用户名
def auth(request: Request) -> SessionBase:
    username = request.cookies.get("u", 's')
    lang = request.headers.get('lang', 'en')
    ip = request.headers.get('x-real-ip', '')
    token = request.cookies.get("token", None)
    if not username or username not in settings.TOKENs or token != settings.TOKENs[username]:
        raise HTTPException(status_code=401)
    return SessionBase(username=username, ip=ip, lang=lang)


def auth_url(request: Request) -> SessionBase:
    username = request.query_params.get('u', '')
    lang = request.query_params.get('lang', 'en')
    ip = request.headers.get('x-real-ip', '')
    token = request.query_params.get("token", None)
    if not username or username not in settings.TOKENs or token != settings.TOKENs[username]:
        raise HTTPException(status_code=401)
    return SessionBase(username=username, ip=ip, lang=lang)
