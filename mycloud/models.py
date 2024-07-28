#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Author: leeyoshinari

from typing import Optional, List, Any
from tortoise import fields
from tortoise.models import Model
from pydantic import BaseModel
from common.calc import beauty_size, beauty_time


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
    format = fields.CharField(max_length=16, null=True, description='文件格式')
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
    format = fields.CharField(max_length=16, default=None, description='文件格式')
    times = fields.IntField(default=0, description='链接已打开次数')
    total_times = fields.IntField(default=1, description='分享链接打开最大次数')
    create_time = fields.DatetimeField(auto_now_add=True, description='创建时间')

    class Meta:
        db_table = 'shares'


# 音乐播放记录
class Musics(Model):
    id = fields.IntField(pk=True, generated=True, description='主键')
    file_id = fields.CharField(max_length=16, description='文件ID')
    name = fields.CharField(max_length=64, description='文件名')
    singer = fields.CharField(max_length=16, description='歌手')
    duration = fields.CharField(max_length=16, description='歌曲时长')
    username = fields.CharField(max_length=16, description='用户名')
    times = fields.IntField(default=1, description="播放次数")
    create_time = fields.DatetimeField(auto_now_add=True)
    update_time = fields.DatetimeField(auto_now=True)

    class Meta:
        db_table = 'music'


class Games(Model):
    id = fields.IntField(pk=True, generated=True, description='主键')
    type = fields.CharField(max_length=8, description='游戏类型')
    name = fields.CharField(max_length=16, description='用户名')
    score = fields.IntField(default=0, description="得分")
    create_time = fields.DatetimeField(auto_now_add=True)
    update_time = fields.DatetimeField(auto_now=True)

    class Meta:
        db_table = 'games'


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
    file_type: str


# 文件、文件夹移动模型
class CatalogMoveTo(BaseModel):
    from_ids: List[str]
    parent_id: str
    to_id: str


# 查询目录模型
class CatalogGetInfo(BaseModel):
    id: str
    name: str

    class Config:
        orm_mode = True
        from_attributes = True


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
    ids: List[Any]
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
        from_attributes = True
        orm_mode = True


# MP3列表
class MP3List(BaseModel):
    id: str
    name: str
    format: str
    size: str
    duration: str

    class Config:
        orm_mode = True

    @classmethod
    def from_orm_format(cls, obj: Files, duration):
        return cls(id=obj.id, name=obj.name, format=obj.format, size=beauty_size(obj.size), duration=duration)


# mp3 历史记录列表
class MusicList(BaseModel):
    file_id: str
    name: str
    singer: str
    duration: str
    create_time: str
    update_time: str

    class Config:
        orm_mode = True

    @classmethod
    def from_orm_format(cls, obj: Musics):
        c = obj.create_time.strftime("%Y-%m-%d %H:%M:%S")
        m = obj.update_time.strftime("%Y-%m-%d %H:%M:%S")
        return cls(file_id=obj.file_id, name=obj.name, singer=obj.singer, duration=obj.duration, create_time=c, update_time=m)


class MusicHistory(BaseModel):
    file_id: str
    name: str
    singer: str = ""
    duration: str


class DownloadFileOnline(BaseModel):
    parent_id: str
    url: str
    cookie: Optional[str] = None


class DownloadFileOnlineStatus(BaseModel):
    gid: str
    status: str


class DownloadList(BaseModel):
    gid: str
    name: str
    path: str
    status: str
    completed_size: str
    total_size: str
    progress: float
    download_speed: str
    eta: str

    @classmethod
    def from_orm_format(cls, obj):
        file_path = obj['files'][0]['path']
        completed_length = int(obj['completedLength'])
        total_length = int(obj['totalLength'])
        download_speed = int(obj['downloadSpeed'])
        eta = beauty_time(int((total_length - completed_length) / download_speed)) if download_speed > 1 else '-'
        if total_length < 1:
            progress = 0
            eta = '-'
        else:
            progress = round((completed_length / total_length) * 100, 2)
        if download_speed < 1:
            eta = '-'

        return cls(gid=obj['gid'], name=file_path.split('/')[-1], path=file_path, status=obj['status'],
                   completed_size=beauty_size(completed_length), total_size=beauty_size(total_length), eta=eta,
                   download_speed=beauty_size(download_speed) + '/s', progress=progress)


class GamesScoreInfo(BaseModel):
    type: str
    score: int


class GamesRankInfo(BaseModel):
    name: str
    score: int

    class Config:
        orm_mode = True
        from_attributes = True
