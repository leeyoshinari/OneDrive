#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import json
from zipfile import ZipFile
# import xmind
from common import xmltodict


def write_xmind(file_path):
    pass


def read_xmind(file_path):
    with ZipFile(file_path) as z:
        if 'content.json' in z.namelist():
            return format_zen_reader(json.loads(z.open('content.json').read().decode('utf-8')))
        else:
            result = format_x_reader(xmltodict.parse(z.open('content.xml').read().decode('utf-8')))
            return result


def format_x_reader(data):
    mind = {'meta': {}, 'format': 'node_tree', 'data': {}}
    res = {}
    for k, v in data['xmap-content']['sheet']['topic'].items():
        if k == '@id':
            res.update({'id': v})
        if k == 'title':
            res.update({'topic': v})
        if k == 'children':
            res.update({'children': x_reader_children(v['topics']['topic'])})
    mind['data'] = res
    return mind


def format_zen_reader(data: list):
    mind = {'meta': {}, 'format': 'node_tree', 'data': {}}
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
                if k == '@id':
                    res.update({'id': v})
                if k == 'title':
                    if isinstance(v, str):
                        res.update({'topic': v})
                    elif isinstance(v, dict):
                        res.update({'topic': v['#text']})
                    else:
                        res.update({'topic': str(v)})
                if k == 'children' and 'topics' in v and 'topic' in v['topics']:
                    res.update({'children': x_reader_children(v['topics']['topic'])})
            result.append(res)
    else:
        res = {}
        for k, v in data.items():
            if k == '@id':
                res.update({'id': v})
            if k == 'title':
                if isinstance(v, str):
                    res.update({'topic': v})
                elif isinstance(v, dict):
                    res.update({'topic': v['#text']})
                else:
                    res.update({'topic': str(v)})
            if k == 'children' and 'topics' in v and 'topic' in v['topics']:
                res.update({'children': x_reader_children(v['topics']['topic'])})
        result.append(res)
    return result
