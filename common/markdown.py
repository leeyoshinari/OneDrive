#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import markdown


extensions = [
    'markdown.extensions.extra',
    'markdown.extensions.codehilite'
]


def md2html(s: str):
    return markdown.markdown(s, extensions=extensions)
