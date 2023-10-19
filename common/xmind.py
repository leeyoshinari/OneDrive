#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import os
import time
import json
import codecs
from zipfile import ZipFile
from common import xmltodict


xmind_files_list = ['content.xml', 'meta.xml',
                    'content.json', 'manifest.json', 'metadata.json']


def create_xmind(file_id, file_path):
    if not os.path.exists('tmp'):
        os.mkdir('tmp')
    tmp_path = os.path.join('tmp', file_id)
    if not os.path.exists(tmp_path):
        os.mkdir(tmp_path)
    content_path = os.path.join(tmp_path, 'content.json')
    content = [{"rootTopic": {"id": str(int(time.time()*1000)), "title": "新建脑图", "class": "topic"}}]
    with codecs.open(content_path, 'w', encoding='utf-8') as f:
        f.write(json.dumps(content))
    with ZipFile(file_path, "w") as z:
        z.write(content_path, 'content.json')


def write_xmind(file_id, file_path, data):
    with ZipFile(file_path, 'r') as z:
        is_zen = 'content.json' in z.namelist()
    tmp_path = os.path.join('tmp', file_id)
    if is_zen:
        content_path = os.path.join(tmp_path, 'content.json')
        if os.path.exists(content_path):
            content = json.load(open(content_path, 'r', encoding='utf-8'))
            content[0]['rootTopic'] = format_zen_writer(data['root'])
            with codecs.open(content_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(content))
        else:
            raise FileNotFoundError("请重新打开文件...")
    else:
        content_path = os.path.join(tmp_path, 'content.xml')
        if os.path.exists(content_path):
            with open(content_path, 'r', encoding='utf-8') as f:
                content = xmltodict.parse(f.read())
            content['xmap-content']['sheet']['topic'] = data['root']
            with codecs.open(content_path, 'w', encoding='utf-8') as f:
                f.write(format_x_writer(content))
        else:
            raise FileNotFoundError("请重新打开文件...")

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
    res = {'data': {}, 'children': []}
    for k, v in data['xmap-content']['sheet']['topic'].items():
        if k == 'id':
            res['data'].update({'id': v})
        if k == 'title':
            res['data'].update({'text': v})
        if k == 'children':
            res.update({'children': x_reader_children(v['topics']['topic'])})
    mind['data'] = res
    return mind


def format_zen_reader(data: list):
    mind = {"template": "right", "theme": "fresh-blue", "version": "0", "root": {}}
    res = {'data': {}, 'children': []}
    for k, v in data[0]['rootTopic'].items():
        if k == 'id':
            res['data'].update({'id': v})
        if k == 'title':
            res['data'].update({'text': v})
        if k in ['background', 'color', 'font-size', 'font-weight', 'font-style']:
            res['data'].update({k: v})
        if k == 'children':
            res.update({'children': zen_reader_children(v['attached'])})
    mind['root'] = res
    return mind


def zen_reader_children(data: list):
    result = []
    for item in data:
        res = {'data': {}, 'children': []}
        for k, v in item.items():
            if k == 'id':
                res['data'].update({'id': v})
            if k == 'title':
                res['data'].update({'text': v})
            if k in ['background', 'color', 'font-size', 'font-weight', 'font-style']:
                res['data'].update({k: v})
            if k == 'children':
                res.update({'children': zen_reader_children(v['attached'])})
        result.append(res)
    return result


def x_reader_children(data):
    result = []
    if isinstance(data, list):
        for item in data:
            res = {'data': {}, 'children': []}
            for k, v in item.items():
                if k == 'id':
                    res['data'].update({'id': v})
                if k == 'title':
                    if isinstance(v, str):
                        res['data'].update({'text': v})
                    elif isinstance(v, dict):
                        res['data'].update({'text': v['text']})
                    else:
                        res['data'].update({'text': str(v)})
                if k == 'children' and 'topics' in v and 'topic' in v['topics']:
                    res.update({'children': x_reader_children(v['topics']['topic'])})
            result.append(res)
    else:
        res = {'data': {}, 'children': []}
        for k, v in data.items():
            if k == 'id':
                res['data'].update({'id': v})
            if k == 'title':
                if isinstance(v, str):
                    res['data'].update({'text': v})
                elif isinstance(v, dict):
                    res['data'].update({'text': v['text']})
                else:
                    res['data'].update({'text': str(v)})
            if k == 'children' and 'topics' in v and 'topic' in v['topics']:
                res.update({'children': x_reader_children(v['topics']['topic'])})
        result.append(res)
    return result


def format_x_writer(data):
    res = ''
    for k, v in data.items():
        s = ''
        sheet = ''
        for k1, v1 in v.items():
            if isinstance(v1, str):
                s += f'{k1}="{v1}" '
            if isinstance(v1, dict):
                ss = ''
                topic = ''
                for k2, v2 in v1.items():
                    if isinstance(v2, str) and k2 != 'title':
                        ss += f'{k2}="{v2}" '
                    if isinstance(v2, dict):
                        topic = f'<topic class="topic" id="{v2["id"]}" timestamp="{int(time.time() * 1000)}"><title>{v2["topic"]}</title><children><topics type="attached">{format_x_children(v2.get("children", []))}</topics></children></topic>'
                sheet = f'<sheet {ss}><title>{v1["title"]}</title>{topic}</sheet>'
        res = f'<?xml version="1.0" encoding="UTF-8" standalone="no"?><{k} {s}>{sheet}</{k}>'
    return res


def format_x_children(data: list):
    res = ''
    for item in data:
        if 'children' in item:
            res += f'<topic id="{item["id"]}" timestamp="{int(time.time() * 1000)}"><title>{item["topic"]}</title><children><topics type="attached">{format_x_children(item.get("children", []))}</topics></children></topic>'
        else:
            res += f'<topic id="{item["id"]}" timestamp="{int(time.time() * 1000)}"><title>{item["topic"]}</title></topic>'
    return res


def format_zen_writer(data):
    res = {'class': 'topic'}
    for k, v in data['data'].items():
        if k == 'id':
            res.update({'id': v})
        if k == 'text':
            res.update({'title': v})
        if k in ['background', 'color', 'font-size', 'font-weight', 'font-style']:
            res.update({k: v})
    res.update({'children': {'attached': zen_writer_children(data['children'])}})
    return res


def zen_writer_children(data: list):
    result = []
    for item in data:
        res = {}
        for k, v in item['data'].items():
            if k == 'id':
                res.update({'id': v})
            if k == 'text':
                res.update({'title': v})
            if k in ['background', 'color', 'font-size', 'font-weight', 'font-style']:
                res.update({k: v})
        res.update({'children': {'attached': zen_writer_children(item['children'])}})
        result.append(res)
    return result

