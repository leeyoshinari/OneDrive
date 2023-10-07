#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

from zipfile import ZipFile
import xmindparser


def read_xmind(file_path):
    xmind_json = xmindparser.xmind_to_dict(file_path)
    print(xmind_json)


def read_xmind_bytes(file_path):
    # with open(file_path, 'rb') as f:
    #     data = f.read()
    with ZipFile(file_path) as xmind:
        for f in xmind.namelist():
            print(xmind.open(f).read())


if __name__ == "__main__":
    # read_xmind("2024.xmind")
    read_xmind_bytes("2024.xmind")
