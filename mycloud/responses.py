#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

import typing
from fastapi.responses import StreamingResponse, Response


class StreamResponse(StreamingResponse):
    # 重写，使用 utf-8 编码
    def init_headers(
        self, headers: typing.Optional[typing.Mapping[str, str]] = None
    ) -> None:
        if headers is None:
            raw_headers: typing.List[typing.Tuple[bytes, bytes]] = []
            populate_content_length = True
            populate_content_type = True
        else:
            raw_headers = [
                (k.lower().encode("utf-8"), v.encode("utf-8"))
                for k, v in headers.items()
            ]
            keys = [h[0] for h in raw_headers]
            populate_content_length = b"content-length" not in keys
            populate_content_type = b"content-type" not in keys

        body = getattr(self, "body", None)
        if (
            body is not None
            and populate_content_length
            and not (self.status_code < 200 or self.status_code in (204, 304))
        ):
            content_length = str(len(body))
            raw_headers.append((b"content-length", content_length.encode("utf-8")))

        content_type = self.media_type
        if content_type is not None and populate_content_type:
            if content_type.startswith("text/"):
                content_type += "; charset=" + self.charset
            raw_headers.append((b"content-type", content_type.encode("utf-8")))

        self.raw_headers = raw_headers


class MyResponse(Response):
    # 重写，使用 utf-8 编码
    def init_headers(
        self, headers: typing.Optional[typing.Mapping[str, str]] = None
    ) -> None:
        if headers is None:
            raw_headers: typing.List[typing.Tuple[bytes, bytes]] = []
            populate_content_length = True
            populate_content_type = True
        else:
            raw_headers = [
                (k.lower().encode("utf-8"), v.encode("utf-8"))
                for k, v in headers.items()
            ]
            keys = [h[0] for h in raw_headers]
            populate_content_length = b"content-length" not in keys
            populate_content_type = b"content-type" not in keys

        body = getattr(self, "body", None)
        if (
            body is not None
            and populate_content_length
            and not (self.status_code < 200 or self.status_code in (204, 304))
        ):
            content_length = str(len(body))
            raw_headers.append((b"content-length", content_length.encode("utf-8")))

        content_type = self.media_type
        if content_type is not None and populate_content_type:
            if content_type.startswith("text/"):
                content_type += "; charset=" + self.charset
            raw_headers.append((b"content-type", content_type.encode("utf-8")))

        self.raw_headers = raw_headers
