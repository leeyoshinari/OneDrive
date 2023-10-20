#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import os
import time
import json
import codecs
from zipfile import ZipFile
from common import xmltodict


def create_xmind(file_id, file_path):
    if not os.path.exists('tmp'):
        os.mkdir('tmp')
    tmp_path = os.path.join('tmp', file_id)
    if not os.path.exists(tmp_path):
        os.mkdir(tmp_path)
    content_path = os.path.join(tmp_path, 'content.json')
    content = {"template": "right", "theme": "fresh-blue", "version": "0", "root": {"data": {"id": str(int(time.time()*1000)), "text": "中心主题"}, "children": [{"data": {"id": str(int(time.time())), "text": "分支主题"}, "children": []}]}}
    with codecs.open(content_path, 'w', encoding='utf-8') as f:
        f.write(json.dumps(content, ensure_ascii=False))
    with ZipFile(file_path, "w") as z:
        z.write(content_path, 'content.json')


def read_xmind(file_id, file_path):
    if not os.path.exists('tmp'):
        os.mkdir('tmp')
    tmp_path = os.path.join('tmp', file_id)
    if not os.path.exists(tmp_path):
        os.mkdir(tmp_path)
    with ZipFile(file_path, 'r') as z:
        with codecs.open(os.path.join(tmp_path, 'content.json'), 'w', encoding='utf-8') as f:
            f.write('{}')
        if len(z.namelist()) == 1 and 'content.json' in z.namelist():
            result = json.loads(z.open('content.json').read().decode('utf-8'))
        elif 'content.json' in z.namelist():
            result = format_zen_reader(json.loads(z.open('content.json').read().decode('utf-8')))
        else:
            result = format_x_reader(xmltodict.parse(z.open('/content.xml').read().decode('utf-8')))
        return result


def write_xmind(file_id, file_path, data):
    tmp_path = os.path.join('tmp', file_id)
    if not os.path.exists(tmp_path):
        raise FileNotFoundError("请重新打开文件...")

    content_path = os.path.join(tmp_path, 'content.json')
    with codecs.open(content_path, 'w', encoding='utf-8') as f:
        f.write(data)
    with ZipFile(file_path, "w") as z:
        z.write(content_path, 'content.json')


def generate_xmind8(file_id, file_name, file_path):
    tmp_path = os.path.join('tmp', file_id)
    if not os.path.exists(tmp_path):
        raise FileNotFoundError("请重新打开文件...")

    with ZipFile(file_path, 'r') as z:
        content = json.loads(z.open('content.json').read().decode('utf-8'))
        with codecs.open(os.path.join(tmp_path, 'content.json'), 'w', encoding='utf-8') as f:
            f.write(z.open('content.json').read().decode('utf-8'))
    new_path = os.path.join(tmp_path, file_name)
    file_name = os.listdir(tmp_path)
    with ZipFile(new_path, "w") as z:
        for file in file_name:
            if 'xmind' in file: continue
            z.write(os.path.join(tmp_path, file), file)


def format_x_reader(data):
    mind = {"template": "right", "theme": "fresh-blue", "version": "0", "root": {}}
    res = {'data': {}, 'children': []}
    for k, v in data['xmap-content']['sheet']['topic'].items():
        if k == 'id':
            res['data'].update({'id': v})
        if k == 'title':
            res['data'].update({'text': v})
        if k == 'children':
            res.update({'children': x_reader_children(v['topics']['topic'])})
    mind['root'] = res
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
                        topic = f'<topic class="topic" id="{v2["data"]["id"]}" timestamp="{int(time.time() * 1000)}"><title>{v2["data"]["text"]}</title><children><topics type="attached">{format_x_children(v2.get("children", []))}</topics></children></topic>'
                sheet = f'<sheet {ss}><title>{v1["title"]}</title>{topic}</sheet>'
        res = f'<?xml version="1.0" encoding="UTF-8" standalone="no"?><{k} {s}>{sheet}</{k}>'
    return res


def format_x_children(data: list):
    res = ''
    for item in data:
        res += f'<topic id="{item["data"]["id"]}" timestamp="{int(time.time() * 1000)}"><title>{item["data"]["text"]}</title><children><topics type="attached">{format_x_children(item.get("children", []))}</topics></children></topic>'
    return res
