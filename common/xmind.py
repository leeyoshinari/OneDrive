#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import os
import json
import codecs
from zipfile import ZipFile
from common import xmltodict


xmind_files_list = ['content.xml', 'meta.xml',
                    'content.json', 'manifest.json', 'metadata.json']


def write_xmind(file_id, file_path, data):
    with ZipFile(file_path, 'r') as z:
        is_zen = 'content.json' in z.namelist()
    tmp_path = os.path.join('tmp', file_id)
    if is_zen:
        content_path = os.path.join(tmp_path, 'content.json')
        if os.path.exists(content_path):
            content = json.load(open(content_path, 'r', encoding='utf-8'))
            content[0]['rootTopic'] = format_zen_writer(data)
            with codecs.open(content_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(content))
        else:
            raise FileNotFoundError("请重新打开文件...")
    else:
        format_x_writer(data)

    file_name = os.listdir(tmp_path)
    with ZipFile(file_path, "w") as z:
        for file in file_name:
            z.write(os.path.join(tmp_path, file), file)


def read_xmind(file_id, file_path):
    if not os.path.exists('tmp'):
        os.mkdir('tmp')
    tmp_path = os.path.join('tmp', file_id)
    if not os.path.exists(tmp_path):
        os.mkdir(tmp_path)
    with ZipFile(file_path, 'r') as z:
        for k in z.namelist():
            if k not in xmind_files_list: continue
            with codecs.open(os.path.join(tmp_path, k), 'w', encoding='utf-8') as f:
                f.write(z.open(k).read().decode('utf-8'))
        if 'content.json' in z.namelist():
            result = format_zen_reader(json.loads(z.open('content.json').read().decode('utf-8')))
        else:
            result = format_x_reader(xmltodict.parse(z.open('content.xml').read().decode('utf-8')))
        return result


def format_x_reader(data):
    mind = {'meta': {'version': '2.0'}, 'format': 'node_tree', 'data': {}}
    res = {}
    for k, v in data['xmap-content']['sheet']['topic'].items():
        if k == 'id':
            res.update({'id': v})
        if k == 'title':
            res.update({'topic': v})
        if k == 'children':
            res.update({'children': x_reader_children(v['topics']['topic'])})
    mind['data'] = res
    return mind


def format_zen_reader(data: list):
    mind = {'meta': {'version': '2.0'}, 'format': 'node_tree', 'data': {}}
    res = {}
    for k, v in data[0]['rootTopic'].items():
        if k == 'id':
            res.update({'id': v})
        if k == 'title':
            res.update({'topic': v})
        if k == 'children':
            res.update({'children': zen_reader_children(v['attached'])})
    mind['data'] = res
    return mind


def zen_reader_children(data: list):
    result = []
    for item in data:
        res = {}
        for k, v in item.items():
            if k == 'id':
                res.update({'id': v})
            if k == 'title':
                res.update({'topic': v})
            if k == 'children':
                res.update({'children': zen_reader_children(v['attached'])})
        result.append(res)
    return result


def x_reader_children(data):
    result = []
    if isinstance(data, list):
        for item in data:
            res = {}
            for k, v in item.items():
                if k == 'id':
                    res.update({'id': v})
                if k == 'title':
                    if isinstance(v, str):
                        res.update({'topic': v})
                    elif isinstance(v, dict):
                        res.update({'topic': v['text']})
                    else:
                        res.update({'topic': str(v)})
                if k == 'children' and 'topics' in v and 'topic' in v['topics']:
                    res.update({'children': x_reader_children(v['topics']['topic'])})
            result.append(res)
    else:
        res = {}
        for k, v in data.items():
            if k == 'id':
                res.update({'id': v})
            if k == 'title':
                if isinstance(v, str):
                    res.update({'topic': v})
                elif isinstance(v, dict):
                    res.update({'topic': v['text']})
                else:
                    res.update({'topic': str(v)})
            if k == 'children' and 'topics' in v and 'topic' in v['topics']:
                res.update({'children': x_reader_children(v['topics']['topic'])})
        result.append(res)
    return result


def format_x_writer(data):
    pass


def format_zen_writer(data):
    res = {'class': 'topic'}
    for k, v in data.items():
        if k == 'id':
            res.update({'id': v})
        if k == 'topic':
            res.update({'title': v})
        if k == 'children':
            res.update({'children': {'attached': zen_writer_children(v)}})
    return res


def zen_writer_children(data: list):
    result = []
    for item in data:
        res = {}
        for k, v in item.items():
            if k == 'id':
                res.update({'id', v})
            if k == 'topic':
                res.update({'title': v})
            if k == 'children':
                res.update({'children': {'attached': zen_writer_children(v)}})
        result.append(res)
    return result

