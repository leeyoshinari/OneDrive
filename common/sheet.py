#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari
import json


def create_sheet(file_path):
    content = [{"name": "1234", "status": "1", "order": "0", "row": 66, "column": 52, "celldata": [{"r": 0, "c": 0, "v": {}}], "config": {}, "index": 0}]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(json.dumps(content, ensure_ascii=False))


def read_sheet(file_path):
    content = json.load(open(file_path, 'r', encoding='utf-8'))
    for i in range(len(content)):
        if "data" in content[i] and content[i]["data"] and len(content[i]["data"]) > 0 and len(content[i]["data"][0]) > 0 and content[i]["data"][0][0]:
            data = content[i].pop("data")
            content[i].update({"celldata": []})
            for d1 in data:
                for d2 in d1:
                    content[i]['celldata'].append(d2)
    return content


def write_sheet(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(data)
