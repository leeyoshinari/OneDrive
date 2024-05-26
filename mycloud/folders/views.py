#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari
import os
import time
import json
import shutil
import traceback
from tortoise import transactions
from tortoise.expressions import Q
from mycloud import models
# from mycloud.onlyoffice.views import remove
from settings import get_config
from common.results import Result
from common.messages import Msg
from common.logging import logger
from common.calc import beauty_size


root_path = json.loads(get_config("rootPath"))


async def get_disk_usage(hh: dict) -> Result:
    result = Result()
    try:
        data = []
        for k, v in root_path.items():
            info = shutil.disk_usage(v)
            data.append({'disk': k, 'total': beauty_size(info.total), 'free': beauty_size(info.free),
                         'used': round(info.used / info.total * 100, 2), 'enableOnlyoffice': get_config("enableOnlyoffice")})
        result.data = data
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_folders_by_id(folder_id: str, hh: dict) -> Result:
    result = Result()
    try:
        if len(folder_id) == 1:
            folder_id = folder_id + hh['u']
        if len(folder_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
            return result
        folders = await models.Catalog.filter(Q(parent_id=folder_id) & Q(is_delete=0))
        folder_list = [models.CatalogGetInfo.from_orm(f) for f in folders if f.id.startswith(tuple('123456789'))]
        folder = await models.Catalog.get(id=folder_id)
        folder_path = await folder.get_all_path()
        for k, v in root_path.items():
            tmp1 = folder_path.replace('\\', '/')
            tmp2 = v.replace('\\', '/') + '/' + hh['u']
            full_path = tmp1.replace(tmp2, '')
            if len(folder_path) != len(full_path):
                folder_path = f"{k}:{full_path}"
                break
        result.data = {'folder': folder_list, 'path': folder_path}
        result.total = len(result.data['folder'])
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, folder_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def create_folder(parent_id: str, hh: dict) -> Result:
    result = Result()
    try:
        if len(parent_id) == 1:
            parent_id = parent_id + hh['u']
        if len(parent_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
            return result
        async with transactions.in_transaction():
            folder = await models.Catalog.create(id=str(int(time.time() * 10000)), name=Msg.Folder[hh['lang']], parent_id=parent_id)
            folder_path = await folder.get_all_path()
            if os.path.exists(folder_path):
                raise FileExistsError
            else:
                os.mkdir(folder_path)
        result.data = folder.id
        result.msg = f"{Msg.MsgCreate[hh['lang']].format(folder.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, folder.id, hh['u'], hh['ip'])}")
    except FileExistsError:
        result.code = 1
        result.msg = Msg.MsgFileExist[hh['lang']].format(Msg.Folder[hh['lang']])
    except:
        result.code = 1
        result.msg = result.msg = f"{Msg.MsgCreate[hh['lang']].format(Msg.Folder[hh['lang']])}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def rename_folder(query: models.FilesBase, hh: dict) -> Result:
    result = Result()
    try:
        async with transactions.in_transaction():
            folder = await models.Catalog.get(id=query.id)
            folder_path = await folder.get_all_path()
            folder.name = query.name
            await folder.save()
            new_path = os.path.join(os.path.dirname(folder_path), query.name)
            if os.path.exists(new_path):
                raise FileExistsError
            else:
                os.rename(folder_path, new_path)
        result.data = query.id
        result.msg = f"{Msg.MsgRename[hh['lang']].format(query.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, folder.id, hh['u'], hh['ip'])}")
    except FileExistsError:
        result.code = 1
        result.msg = Msg.MsgRenameError[hh['lang']]
    except:
        result.code = 1
        result.msg = f"{Msg.MsgRename[hh['lang']].format(query.name)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def move_to_folder(query: models.CatalogMoveTo, hh: dict) -> Result:
    result = Result()
    try:
        if len(query.parent_id) == 1:
            query.parent_id = query.parent_id + hh['u']
        if len(query.parent_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
            return result
        if len(query.to_id) == 1:
            query.to_id = query.to_id + hh['u']
        if len(query.to_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
            return result
        froms = await models.Catalog.get(id=query.parent_id)
        from_path = await froms.get_all_path()
        tos = await models.Catalog.get(id=query.to_id)
        to_path = await tos.get_all_path()
        for folder_id in query.from_ids:
            async with transactions.in_transaction():
                folder = await models.Catalog.get(id=folder_id)
                folder.parent_id = query.to_id
                await folder.save()
                shutil.move(os.path.join(from_path, folder.name), to_path)
        result.msg = f"{Msg.MsgMove[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgMove[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def delete_file(query: models.IsDelete, hh: dict) -> Result:
    result = Result()
    try:
        if query.delete_type == 0:      # 软删除 或者 从回收站还原
            if query.file_type == 'folder':
                for file_id in query.ids:
                    folder = await models.Catalog.get(id=file_id)
                    folder.is_delete = query.is_delete
                    await folder.save()
                    logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDelete[hh['lang']].format(folder.name) + Msg.Success[hh['lang']], folder.id, hh['u'], hh['ip'])}")
            if query.file_type == 'file':
                for file_id in query.ids:
                    file = await models.Files.get(id=file_id)
                    file.is_delete = query.is_delete
                    await file.save()
                    logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDelete[hh['lang']].format(file.name) + Msg.Success[hh['lang']], file.id, hh['u'], hh['ip'])}")

        if query.delete_type == 1 or query.delete_type == 2:       # 硬删除，从回收站彻底删除
            if query.file_type == 'folder':
                folders = await models.Catalog.filter(id__in=query.ids)
                for folder in folders:
                    try:
                        async with transactions.in_transaction():
                            folder_path = await folder.get_all_path()
                            await folder.delete()
                            shutil.rmtree(folder_path)
                        logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDelete[hh['lang']].format(folder.name) + Msg.Success[hh['lang']], folder.id, hh['u'], hh['ip'])}")
                    except FileNotFoundError:
                        logger.error(traceback.format_exc())
                        result.code = 1
                        result.msg = Msg.MsgFileNotExist[hh['lang']].format(folder.name)
                        logger.error(f"{Msg.CommonLog1[hh['lang']].format(result.msg, folder.id, hh['u'], hh['ip'])}")
                        return result
            if query.file_type == 'file':
                files = await models.Files.filter(id__in=query.ids).select_related('parent')
                for file in files:
                    async with transactions.in_transaction():
                        file_path = await file.parent.get_all_path()
                        try:
                            os.remove(os.path.join(file_path, file.name))
                            # if file.format in ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']:
                            #     remove(file.id, hh)
                        except FileNotFoundError:
                            logger.error(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgFileNotExist[hh['lang']].format(file.name), file.id, hh['u'], hh['ip'])}")
                            logger.error(traceback.format_exc())
                        await file.delete()
                    logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDelete[hh['lang']].format(file.name) + Msg.Success[hh['lang']], file.id, hh['u'], hh['ip'])}")

        if query.delete_type == 0 and query.is_delete == 0:
            result.msg = f"{Msg.MsgRestore[hh['lang']].format('')}{Msg.Success[hh['lang']]}"
        else:
            result.msg = f"{Msg.MsgDelete[hh['lang']].format('')}{Msg.Success[hh['lang']]}"
    except:
        result.code = 1
        if query.delete_type == 0 and query.is_delete == 0:
            result.msg = f"{Msg.MsgRestore[hh['lang']].format('')}{Msg.Failure[hh['lang']]}"
        else:
            result.msg = f"{Msg.MsgDelete[hh['lang']].format('')}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result
