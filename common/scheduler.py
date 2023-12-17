#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import os
import shutil
from apscheduler.schedulers.background import BackgroundScheduler
from common.logging import logger


scheduler = BackgroundScheduler()


def remove_tmp_folder():
    if os.path.join('tmp'):
        folders = os.listdir('tmp')
        for folder in folders:
            shutil.rmtree(os.path.join('tmp', folder))
            logger.info(f"Clearing temporary directory successfully - {folder}")


scheduler.add_job(remove_tmp_folder, 'cron', hour=5, minute=20, second=21)
scheduler.start()
