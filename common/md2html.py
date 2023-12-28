#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari
# https://github.com/Python-Markdown/markdown/wiki/Third-Party-Extensions
import markdown
from .markdown_extension.checklist_extension import ChecklistExtension


def md_to_html(md_str: str) -> str:
    return markdown.markdown(md_str, extensions=['markdown.extensions.toc', 'markdown.extensions.fenced_code',
                                                 'markdown.extensions.tables', 'markdown.extensions.abbr',
                                                 'markdown.extensions.attr_list', 'markdown.extensions.def_list',
                                                 'markdown.extensions.admonition', 'markdown.extensions.footnotes',
                                                 'markdown.extensions.md_in_html', 'markdown.extensions.codehilite',
                                                 'markdown.extensions.meta', 'markdown.extensions.nl2br',
                                                 'markdown.extensions.sane_lists', 'markdown.extensions.smarty',
                                                 ChecklistExtension()])
