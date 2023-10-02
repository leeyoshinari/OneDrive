#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

from markdown import markdown


extensions = [
    'markdown.extensions.fenced_code',
    'markdown.extensions.codehilite',
    'markdown.extensions.extra',
    'markdown.extensions.tables',
    'markdown.extensions.toc',
]


def md2html(s: str):
    return markdown(s, extensions=extensions)
