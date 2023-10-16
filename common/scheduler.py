#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import os
import shutil
from apscheduler.schedulers.background import BackgroundScheduler
from common.logging import logger


scheduler = BackgroundScheduler()


def remove_folder_xmind():
    if os.path.join('tmp'):
        folders = os.listdir('tmp')
        for folder in folders:
            shutil.rmtree(os.path.join('tmp', folder))
            logger.info(f"定时清除 xmind 临时目录成功 - {folder}")


scheduler.add_job(remove_folder_xmind, 'cron', hour=5, minute=20, second=21)
scheduler.start()
