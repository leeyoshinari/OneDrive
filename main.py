#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from tortoise.contrib.fastapi import register_tortoise
from common.calc import modify_prefix
import common.scheduler
import settings
import mycloud.user.urls as user_urls
import mycloud.folders.urls as folder_urls
import mycloud.files.urls as file_urls
import mycloud.music.urls as music_urls
import mycloud.SSH.urls as ssh_urls
import mycloud.share.urls as share_urls
import mycloud.games.urls as game_urls
import mycloud.downloader.urls as downloader_urls
# import mycloud.onlyoffice.urls as onlyoffice_urls


prefix = settings.get_config("prefix")
app = FastAPI(docs_url=None, redoc_url=None, root_path='/api/openapi')
register_tortoise(app=app, config=settings.TORTOISE_ORM)
modify_prefix(settings.get_config("prefix"))


@app.get(prefix + "/swagger-ui", include_in_schema=False)
async def get_docs():
    return get_swagger_ui_html(openapi_url='/api/openapi/openapi.json', title='Windows swagger-ui',)
                               # swagger_js_url='/OneDrive/js/swagger-ui-bundle.js', swagger_css_url='/OneDrive/css/swagger-ui.css')


app.include_router(user_urls.router, prefix=prefix)
app.include_router(folder_urls.router, prefix=prefix)
app.include_router(file_urls.router, prefix=prefix)
app.include_router(ssh_urls.router, prefix=prefix)
app.include_router(music_urls.router, prefix=prefix)
app.include_router(share_urls.router, prefix=prefix)
app.include_router(downloader_urls.router, prefix=prefix)
# app.include_router(onlyoffice_urls.router, prefix=prefix)
app.include_router(game_urls.router, prefix=prefix)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host=settings.get_config('host'), port=int(settings.get_config('port')), reload=False)
