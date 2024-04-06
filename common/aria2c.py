#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari
import time
import subprocess
import requests
from common.logging import logger


class Aria2Downloader:
    def __init__(self, aria2c_path='aria2c', rpc_port=6800):
        self.aria2c_path = aria2c_path
        self.rpc_port = rpc_port
        self.rpc_url = f'http://localhost:{rpc_port}/jsonrpc'
        self.process = None

    def start_rpc_server(self):
        self.process = subprocess.Popen([self.aria2c_path, '--enable-rpc=true', f'--rpc-listen-port={self.rpc_port}'])
        logger.info('aria2c RPC server started.')

    def stop_rpc_server(self):
        if self.process:
            self.process.terminate()
            self.process.wait()
            self.process = None
            logger.info('aria2c RPC server stopped.')
        else:
            logger.info('aria2c RPC server has stopped.')

    def add_download_task(self, url: str, file_path: str, cookie: str = ""):
        if not self.process:
            self.start_rpc_server()
        options = {
            # "max-download-limit": "30K",
            "max-connection-per-server": "5",
            "split": "5",
            "continue": "true",
            "dir": file_path
        }
        if cookie:
            options["header"] = "Cookie:" + cookie
        payload = {
            "jsonrpc": "2.0",
            "method": "aria2.addUri",
            "id": "1",
            "params": [[url], options]
        }
        response = requests.post(self.rpc_url, json=payload)
        logger.info(response.json())
        return response.json().get('result')

    def list_download_tasks(self):
        payload = {
            "jsonrpc": "2.0",
            "method": "aria2.tellActive",
            "id": "2"
        }
        response = requests.post(self.rpc_url, json=payload)
        res = response.json().get('result', [])
        payload = {
            "jsonrpc": "2.0",
            "method": "aria2.tellWaiting",
            "id": "3",
            "params": [0, 100]
        }
        response = requests.post(self.rpc_url, json=payload)
        res += response.json().get('result', [])
        return res

    def close_aria2c_downloader(self):
        if self.process:
            tasks = self.list_download_tasks()
            if not tasks:
                time.sleep(10)
                tasks = self.list_download_tasks()
                if not tasks:
                    self.stop_rpc_server()

    def get_completed_task_info(self, gid):
        payload = {
            "jsonrpc": "2.0",
            "method": "aria2.tellStatus",
            "id": "5",
            "params": [gid]
        }
        response = requests.post(self.rpc_url, json=payload)
        return response.json().get('result', {})

    def update_task(self, gid, method):
        methods = {'cancel': 'aria2.remove', 'continue': 'aria2.unpause', 'pause': 'aria2.pause'}
        payload = {
            "jsonrpc": "2.0",
            "method": methods[method],
            "id": "4",
            "params": [gid]
        }
        response = requests.post(self.rpc_url, json=payload)
        return response.json()
