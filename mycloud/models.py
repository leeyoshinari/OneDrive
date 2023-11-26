#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

from typing import Optional, List, Any
from tortoise import fields
from tortoise.models import Model
from pydantic import BaseModel
from common.calc import beauty_size


# 用户数据库模型
class User(Model):
    id = fields.IntField(pk=True, generated=True, description='主键')
    username = fields.CharField(max_length=16, description='用户名')
    password = fields.CharField(max_length=32, description='密码')
    create_time = fields.DatetimeField(auto_now_add=True)
    update_time = fields.DatetimeField(auto_now=True)

    class Meta:
        db_table = 'user'


# 文件夹数据库模型
class Catalog(Model):
    id = fields.CharField(max_length=16, pk=True, description='目录ID')
    parent = fields.ForeignKeyField('models.Catalog', on_delete=fields.CASCADE, null=True, related_name='catalog', description='目录父ID')
    name = fields.CharField(max_length=50, description='目录名')
    is_delete = fields.IntField(default=0, description='是否删除, 0-不删除, 1-删除')
    create_time = fields.DatetimeField(auto_now_add=True, description='Create time')
    update_time = fields.DatetimeField(auto_now=True, description='Update time')

    class Meta:
        table = 'catalog'

    async def get_all_path(self):
        paths = []
        curr_node = self
        while curr_node:
            paths.append(curr_node.name)
            curr_node = await curr_node.parent
        return '/'.join(paths[::-1])


# 文件数据库模型
class Files(Model):
    id = fields.CharField(max_length=16, pk=True, description='文件ID')
    name = fields.CharField(max_length=64, description='文件名')
    format = fields.CharField(max_length=8, null=True, description='文件格式')
    parent = fields.ForeignKeyField('models.Catalog', on_delete=fields.CASCADE, related_name='files', description='目录ID')
    size = fields.BigIntField(default=None, null=True, description='文件大小')
    md5 = fields.CharField(max_length=50, index=True, description='文件的MD5值')
    is_delete = fields.IntField(default=0, description='是否删除, 0-不删除, 1-删除')
    create_time = fields.DatetimeField(auto_now_add=True)
    update_time = fields.DatetimeField(auto_now=True, index=True)

    class Meta:
        db_table = 'files'


# 文件分享数据库模型
class Shares(Model):
    id = fields.IntField(pk=True, generated=True, description='主键')
    file_id = fields.CharField(max_length=16, description='文件ID')
    name = fields.CharField(max_length=50, description='文件名')
    path = fields.CharField(max_length=256, description='文件路径')
    format = fields.CharField(max_length=8, default=None, description='文件格式')
    times = fields.IntField(default=0, description='链接已打开次数')
    total_times = fields.IntField(default=1, description='分享链接打开最大次数')
    create_time = fields.DatetimeField(auto_now_add=True, description='创建时间')

    class Meta:
        db_table = 'shares'


# 服务器文件
class Servers(Model):
    id = fields.CharField(max_length=16, pk=True, description='ID')
    host = fields.CharField(max_length=16, description='服务器ID')
    port = fields.IntField(default=22, description='端口')
    user = fields.CharField(max_length=16, description='用户名')
    pwd = fields.CharField(max_length=36, description='密码')
    system = fields.CharField(max_length=64, description='系统')
    cpu = fields.IntField(default=1, description='cpu逻辑核数')
    mem = fields.FloatField(default=0.1, description='内存G')
    disk = fields.CharField(max_length=8, description='磁盘大小')
    create_time = fields.DatetimeField(auto_now_add=True)
    update_time = fields.DatetimeField(auto_now=True)

    class Meta:
        db_table = 'servers'


# 用户模型
class UserBase(BaseModel):
    t: str
    username: str
    password: str


# 新建用户
class CreateUser(UserBase):
    password1: str


# 搜索文件
class SearchItems(BaseModel):
    q: Optional[str] = None
    sort_field: str = 'update_time'
    sort_type: str = 'desc'
    page: int = 1
    page_size: int = 20


# 新建文件、文件夹
class CatalogBase(BaseModel):
    id: str
    type: str
    file_type: str


# 文件、文件夹移动模型
class CatalogMoveTo(BaseModel):
    from_ids: List[str]
    parent_id: str
    to_id: str
    folder_type: str = 'folder'


# 查询目录模型
class CatalogGetInfo(BaseModel):
    id: str
    name: str

    class Config:
        orm_mode = True


# 文件夹列表
class FolderList(BaseModel):
    id: str
    name: str
    folder_type: str = 'folder'
    format: str = ""
    size: int = 0
    create_time: str
    update_time: str

    class Config:
        orm_mode = True

    @classmethod
    def from_orm_format(cls, obj: Catalog):
        c = obj.create_time.strftime("%Y-%m-%d %H:%M:%S")
        m = obj.update_time.strftime("%Y-%m-%d %H:%M:%S")
        return cls(id=obj.id, name=obj.name, create_time=c, update_time=m)


# 重命名文件、文件夹
class FilesBase(BaseModel):
    id: str
    type: str
    name: str


# 文件列表
class FileList(BaseModel):
    id: str
    name: str
    folder_type: str = 'file'
    format: str
    size: str
    create_time: str
    update_time: str

    class Config:
        orm_mode = True

    @classmethod
    def from_orm_format(cls, obj: Files):
        c = obj.create_time.strftime("%Y-%m-%d %H:%M:%S")
        m = obj.update_time.strftime("%Y-%m-%d %H:%M:%S")
        return cls(id=obj.id, name=obj.name, format=obj.format, size=beauty_size(obj.size), create_time=c, update_time=m)


# 文件下载模型
class DownloadFile(BaseModel):
    ids: List[str]
    file_type: str = "file"


# 文件保存模型
class SaveFile(BaseModel):
    id: str
    data: Any


# 文件删除模型
class IsDelete(BaseModel):
    ids: List[str]
    file_type: str = "file"
    is_delete: int = 1
    delete_type: int = 0


# 文件分享模型
class ShareFile(BaseModel):
    id: str
    times: int


# 分享文件列表模型
class ShareFileList(BaseModel):
    id: int
    name: str
    format: str
    times: int
    total_times: int
    create_time: str

    class Config:
        orm_mode = True

    @classmethod
    def from_orm_format(cls, obj: Shares):
        c = obj.create_time.strftime("%Y-%m-%d %H:%M:%S")
        return cls(id=obj.id, name=obj.name, format=obj.format, create_time=c, times=obj.times, total_times=obj.total_times)


# 本地文件导入模型
class ImportLocalFileByPath(BaseModel):
    id: str
    path: str


# 服务器模型
class ServerModel(BaseModel):
    t: str
    host: str
    port: int
    user: str
    pwd: str


class ServerListModel(BaseModel):
    id: str
    host: str
    port: int
    user: str
    system: str
    cpu: int
    mem: float
    disk: str

    class Config:
        orm_mode = True
