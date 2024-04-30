#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

import os
import configparser

cfg = configparser.ConfigParser()
path = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(path, 'config.conf')
cfg.read(config_path, encoding='utf-8')
TOKENs = {}


def get_config(key):
    return cfg.get('default', key, fallback=None)


TORTOISE_ORM = {
    "connections": {"default": get_config("dbUrl")},
    "apps": {
        "models": {
            "models": ["mycloud.models", "aerich.models"],
            "default_connection": "default"
        }
    },
    "timezone": "Asia/Shanghai"
}

CONTENT_TYPE = {'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'bmp': 'image/bmp', 'png': 'image/png', 'pdf': 'application/pdf',
                'mp4': 'video/mp4', 'zip': 'application/zip', 'mp3': 'audio/mpeg', 'html': 'text/html', 'py': 'text/x-python',
                'txt': 'text/plain', 'json': 'application/json', 'sh': 'text/x-sh', 'js': 'text/javascript', 'css': 'text/css'}

HTML404 = """<!doctype html><html><head><title>Welcome to nginx!</title>
<style>body{width:35em;margin:0 auto;}</style></head><body><h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p><p>For online documentation and support please refer to nginx.org.<br>
Commercial support is available at nginx.com.</p><p><em>Thank you for using nginx.</em></p></body></html>"""
