#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

import hashlib


def str_md5(s: str):
    myhash = hashlib.md5()
    myhash.update(s.encode('utf-8'))
    return myhash.hexdigest()


def calc_md5(f):
    myhash = hashlib.md5()
    while True:
        b = f.read(8096)
        if not b:
            break
        myhash.update(b)
    return myhash.hexdigest()


def calc_file_md5(file_path: str):
    with open(file_path, 'rb') as f:
        res = calc_md5(f)
    return res


def beauty_size(size):
    size = size / 1024
    if size < 1000:
        return f'{round(size, 2)} KB'
    else:
        size = size / 1024
    if size < 1000:
        return f'{round(size, 2)} MB'
    else:
        return f'{round(size / 1024, 2)} GB'


def modify_prefix(prefix='/mycloud'):
    with open('web/login.js', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    lines[0] = f"const server = '{prefix}';\n"
    with open('web/login.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
