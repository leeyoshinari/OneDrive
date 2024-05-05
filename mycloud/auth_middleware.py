#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

from fastapi import Request, HTTPException
import settings


# 校验用户是否登陆，返回用户名
def auth(request: Request) -> dict:
    username = request.cookies.get("u", 's')
    lang = request.headers.get('lang', 'en')
    ip = request.headers.get('x-real-ip', '')
    token = request.cookies.get("token", None)
    if not username or username not in settings.TOKENs or token != settings.TOKENs[username]:
        raise HTTPException(status_code=401)
    return {'u': username, 'ip': ip, 'lang': lang}

