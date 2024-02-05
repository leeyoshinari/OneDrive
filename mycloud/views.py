#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari
import os
import time
import json
import shutil
import zipfile
import traceback
import eyed3
from tortoise import transactions
from tortoise.expressions import Q
from tortoise.exceptions import DoesNotExist
from . import models
from settings import get_config, path
from common.results import Result
from common.messages import Msg
from common.logging import logger
from common.ssh import UploadAndDownloadFile, get_server_info
from common.calc import calc_md5, calc_file_md5, beauty_mp3_time
from common.xmind import read_xmind, create_xmind, generate_xmind8
from common.sheet import read_sheet, create_sheet
from common.md2html import md_to_html


root_path = json.loads(get_config("rootPath"))
if not os.path.exists('tmp'):
    os.mkdir('tmp')


async def create_file(folder_id: str, file_type: str, hh: dict) -> Result:
    result = Result()
    try:
        if len(folder_id) == 1:
            folder_id = folder_id + hh['u']
        if len(folder_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
            return result
        folder = await models.Catalog.get(id=folder_id)
        folder_path = await folder.get_all_path()
        async with transactions.in_transaction():
            file_id = str(int(time.time() * 10000))
            if file_type == 'md':
                file_name = Msg.FileMd[hh['lang']]
            elif file_type == 'xmind':
                file_name = Msg.FileXmind[hh['lang']]
            elif file_type == 'sheet':
                file_name = Msg.FileSheet[hh['lang']]
            elif file_type == 'docu':
                file_name = Msg.FileDocu[hh['lang']]
            elif file_type == 'py':
                file_name = Msg.FilePy[hh['lang']]
            else:
                file_name = f"{Msg.FileTxt[hh['lang']]}.{file_type}"
            files = await models.Files.create(id=file_id, name=file_name, format=file_type, parent_id=folder_id, size=0, md5='0')
            file_path = os.path.join(folder_path, file_name)
            if os.path.exists(file_path):
                raise FileExistsError
            else:
                if file_type == 'xmind':
                    create_xmind(file_path)
                elif file_type == 'sheet':
                    create_sheet(file_path)
                else:
                    f = open(file_path, 'w', encoding='utf-8')
                    f.close()
        result.data = files.id
        result.msg = f"{Msg.MsgCreate[hh['lang']].format(files.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
    except FileExistsError:
        result.code = 1
        result.msg = Msg.MsgFileExist[hh['lang']].format(file_name)
    except:
        result.code = 1
        result.msg = f"{Msg.MsgCreate[hh['lang']].format(file_type)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_all_files(parent_id: str, query: models.SearchItems, hh: dict) -> Result:
    """获取目录下的所有文件"""
    result = Result()
    try:
        if len(parent_id) == 1:
            parent_id = parent_id + hh['u']
        if len(parent_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
            return result
        order_type = f'-{query.sort_field}' if query.sort_type == 'desc' else f'{query.sort_field}'
        if parent_id == 'garbage':
            folders = await models.Catalog.filter(is_delete=1).order_by(order_type)
            files = await models.Files.filter(is_delete=1).order_by(order_type)
        elif parent_id == 'search':
            folders = await models.Catalog.filter(Q(is_delete=0) & Q(name__contains=query.q)).order_by(order_type)
            files = await models.Files.filter(Q(is_delete=0) & Q(name__contains=query.q)).order_by(order_type)
        else:
            folders = await models.Catalog.filter(Q(parent_id=parent_id) & Q(is_delete=0)).order_by(order_type)
            files = await models.Files.filter(Q(parent_id=parent_id) & Q(is_delete=0)).order_by(order_type)

        folder_list = [models.FolderList.from_orm_format(f).dict() for f in folders if f.id.startswith(tuple('123456789'))]
        file_list = [models.FileList.from_orm_format(f).dict() for f in files]
        result.data = folder_list + file_list
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, parent_id, hh['u'], hh['ip'])}")
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


async def rename_file(query: models.FilesBase, hh: dict) -> Result:
    result = Result()
    try:
        file_list = query.name.split('.')
        async with transactions.in_transaction():
            file = await models.Files.get(id=query.id).select_related('parent')
            folder_path = await file.parent.get_all_path()
            origin_name = file.name
            if len(file_list) > 1:
                file.name = query.name
                file.format = file_list[-1]
            else:
                file.name = f"{query.name}.{file.format}"
            await file.save()
            if os.path.exists(os.path.join(folder_path, file.name)):
                raise FileExistsError
            else:
                os.rename(os.path.join(folder_path, origin_name), os.path.join(folder_path, file.name))
        result.data = query.id
        result.msg = f"{Msg.MsgRename[hh['lang']].format(file.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file.id, hh['u'], hh['ip'])}")
    except FileExistsError:
        result.code = 1
        result.msg = Msg.MsgRenameError[hh['lang']]
    except:
        result.code = 1
        result.msg = f"{Msg.MsgRename[hh['lang']].format(query.name)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def copy_file(file_id: str, hh: dict) -> Result:
    result = Result()
    try:
        file = await models.Files.get(id=file_id).select_related('parent')
        folder_path = await file.parent.get_all_path()
        file_name_list = file.name.split('.')
        file_name = f"{file.name.replace(f'.{file_name_list[-1]}', '')} - {Msg.MsgCopyName[hh['lang']]}.{file_name_list[-1]}"
        async with transactions.in_transaction():
            new_file = await models.Files.create(id=str(int(time.time() * 10000)), name=file_name, format=file.format,
                                                 parent_id=file.parent_id, size=file.size, md5='0')
            if os.path.exists(os.path.join(folder_path, file_name)):
                raise FileExistsError
            shutil.copy2(os.path.join(folder_path, file.name), os.path.join(folder_path, file_name))
        result.data = new_file.id
        result.msg = f"{Msg.MsgCopy[hh['lang']].format(file.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, new_file.id, hh['u'], hh['ip'])}")
    except FileExistsError:
        result.code = 1
        result.msg = Msg.MsgFileExist[hh['lang']].format(file_name)
    except:
        result.code = 1
        result.msg = f"{Msg.MsgCopy[hh['lang']].format(file_id)}{Msg.Failure[hh['lang']]}"
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
                        except FileNotFoundError:
                            logger.error(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgFileNotExist[hh['lang']].format(file.name), file.id, hh['u'], hh['ip'])}")
                            logger.error(traceback.format_exc())
                        await file.delete()
                    logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDelete[hh['lang']].format(file.name) + Msg.Success[hh['lang']], file.id, hh['u'], hh['ip'])}")

        if query.delete_type == 3:      # 删除分享的文件
            _ = await models.Shares.filter(id__in=query.ids).delete()
            logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDelete[hh['lang']].format(query.ids) + Msg.Success[hh['lang']], query.ids, hh['u'], hh['ip'])}")
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
        if query.folder_type == 'folder':
            for folder_id in query.from_ids:
                async with transactions.in_transaction():
                    folder = await models.Catalog.get(id=folder_id)
                    folder.parent_id = query.to_id
                    await folder.save()
                    shutil.move(os.path.join(from_path, folder.name), to_path)
        else:
            for file_id in query.from_ids:
                async with transactions.in_transaction():
                    file = await models.Files.get(id=file_id)
                    file.parent_id = query.to_id
                    await file.save()
                    shutil.move(os.path.join(from_path, file.name), to_path)
        result.msg = f"{Msg.MsgMove[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgMove[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def upload_file(query, hh: dict) -> Result:
    result = Result()
    query = await query.form()
    parent_id = query['parent_id']
    file_name = query['file'].filename
    if len(parent_id) == 1:
        parent_id = parent_id + hh['u']
    if len(parent_id) <= 3:
        result.code = 1
        result.data = file_name
        result.msg = Msg.MsgAccessPermissionNon[hh['lang']]
        return result
    data = query['file'].file
    md5 = calc_md5(data)
    try:
        file = await models.Files.get(md5=md5)
        result.code = 2
        result.data = file.name
        result.msg = f"{Msg.MsgUpload[hh['lang']].format(file_name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file.id, hh['u'], hh['ip'])}")
        return result
    except DoesNotExist:
        data.seek(0)
    try:
        folder = await models.Catalog.get(id=parent_id)
        parent_path = await folder.get_all_path()
        file_path = os.path.join(parent_path, file_name)
        async with transactions.in_transaction():
            file = await models.Files.create(id=str(int(time.time() * 10000)), name=file_name, format=file_name.split(".")[-1].lower(),
                                             parent_id=parent_id, size=query['file'].size, md5=md5)
            with open(file_path, 'wb') as f:
                f.write(data.read())
        result.msg = f"{Msg.MsgUpload[hh['lang']].format(file_name)}{Msg.Success[hh['lang']]}"
        result.data = file.name
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file.id, hh['u'], hh['ip'])}, content_type: {query['file'].content_type}")
    except:
        result.code = 1
        result.data = file_name
        result.msg = f"{Msg.MsgUpload[hh['lang']].format(file_name)}{Msg.Failure[hh['lang']]}"
        logger.error(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
        logger.error(traceback.format_exc())
    return result


async def upload_file_by_path(query: models.ImportLocalFileByPath, hh: dict) -> Result:
    try:
        to_folder = await models.Catalog.get(id=query.id)
        to_path = await to_folder.get_all_path()
        for file in os.listdir(query.path):
            file_path = os.path.join(query.path, file)
            if os.path.isfile(file_path):
                md5 = calc_file_md5(file_path)
                try:
                    _ = await models.Files.get(md5=md5)
                    logger.info(f"{Msg.MsgUpload[hh['lang']].format(file)}{Msg.Success[hh['lang']]}")
                    continue
                except DoesNotExist:
                    pass
                try:
                    async with transactions.in_transaction():
                        file_obj = await models.Files.create(id=str(int(time.time() * 10000)), name=file, format=file.split('.')[-1].lower(),
                                                             parent_id=to_folder.id, size=os.path.getsize(file_path), md5=md5)
                        shutil.move(file_path, to_path)
                        logger.info(f"{Msg.MsgUpload[hh['lang']].format(file_obj.name)}{Msg.Success[hh['lang']]}")
                except:
                    logger.error(traceback.format_exc())
                    logger.error(f"{Msg.MsgUpload[hh['lang']].format(file)}{Msg.Failure[hh['lang']]}")
            else:
                async with transactions.in_transaction():
                    folder = await models.Catalog.create(id=str(int(time.time() * 10000)), name=file, parent_id=query.id)
                    folder_path = await folder.get_all_path()
                    os.mkdir(folder_path)
                query1 = models.ImportLocalFileByPath(id=folder.id, path=file_path)
                await upload_file_by_path(query1, hh)
        logger.info(f"{Msg.MsgUpload[hh['lang']].format(query.path)}{Msg.Success[hh['lang']]}")
        return Result(msg=f"{Msg.MsgUpload[hh['lang']].format(query.path)}{Msg.Success[hh['lang']]}")
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=f"{Msg.MsgUpload[hh['lang']].format(query.path)}{Msg.Failure[hh['lang']]}")


async def get_file_by_id(file_id: str, hh: dict) -> Result:
    result = Result()
    try:
        file = await models.Files.get(id=file_id).select_related('parent')
        parent_path = await file.parent.get_all_path()
        if file.format == 'xmind':
            xmind = read_xmind(os.path.join(parent_path, file.name))
            result.data = xmind
        elif file.format == 'sheet':
            excel = read_sheet(os.path.join(parent_path, file.name))
            result.data = excel
        else:
            with open(os.path.join(parent_path, file.name), 'r', encoding='utf-8') as f:
                result.data = f.read()
        result.msg = file.name
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgQuery[hh['lang']] + Msg.Success[hh['lang']], file.id, hh['u'], hh['ip'])}")
    except KeyError:
        result.code = 1
        result.msg = Msg.MsgFileTypeError[hh['lang']].format(file.format)
        logger.error(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file.id, hh['u'], hh['ip'])}")
        logger.error(traceback.format_exc())
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def download_file(file_id: str, hh: dict) -> dict:
    file = await models.Files.get(id=file_id).select_related('parent')
    parent_path = await file.parent.get_all_path()
    result = {'path': os.path.join(parent_path, file.name), 'name': file.name, 'format': file.format}
    logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgDownload[hh['lang']].format(file.name), file.id, hh['u'], hh['ip'])}")
    return result


async def zip_file(query: models.DownloadFile, hh: dict) -> Result:
    result = Result()
    try:
        if query.file_type == 'folder':
            files = await models.Files.filter(parent_id=query.ids[0])
            folder = await models.Catalog.get(id=query.ids[0])
            parent_path = await folder.get_all_path()
        else:
            files = await models.Files.filter(id__in=query.ids)
            folder = await models.Catalog.get(id=files[0].parent_id)
            parent_path = await folder.get_all_path()
        zip_path = os.path.join(parent_path, f"{folder.name}.zip")
        if os.path.exists(zip_path):
            result.code = 1
            result.msg = Msg.MsgFileExist.format(zip_path)
            return result
        zip_multiple_file(zip_path, files, parent_path)
        file = await models.Files.create(id=str(int(time.time() * 10000)), name=f"{folder.name}.zip", format='zip', parent_id=folder.id,
                                         size=os.path.getsize(zip_path), md5=calc_file_md5(zip_path))
        result.data = file.id
        result.msg = f"{Msg.MsgExport[hh['lang']].format(file.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file.id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgExport[hh['lang']].format(query.ids)}{Msg.Failure[hh['lang']]}"
        logger.error(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
        logger.error(traceback.format_exc())
    return result


def zip_multiple_file(zip_path, file_list, parent_path):
    archive = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED)
    for file in file_list:
        archive.write(os.path.join(parent_path, file.name), file.name)
    archive.close()


async def share_file(query: models.ShareFile, hh: dict) -> Result:
    result = Result()
    try:
        file = await models.Files.get(id=query.id).select_related('parent')
        parent_path = await file.parent.get_all_path()
        share = await models.Shares.create(file_id=file.id, name=file.name, path=os.path.join(parent_path, file.name),
                                           format=file.format, times=0, total_times=query.times)
        result.msg = f"{Msg.MsgShare[hh['lang']].format(share.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, share.id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgShare[hh['lang']].format(query.id)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_share_file(hh: dict) -> Result:
    result = Result()
    try:
        files = await models.Shares.all().order_by('-create_time')
        result.data = [models.ShareFileList.from_orm_format(f).dict() for f in files]
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def open_share_file(share_id: int, hh: dict) -> dict:
    try:
        share = await models.Shares.get(id=share_id)
        if share.times < share.total_times:
            share.times = share.times + 1
            await share.save()
            result = {'type': 0, 'path': share.path, 'name': share.name, 'format': share.format, 'file_id': share.file_id}
            logger.info(f"{share.name} - {Msg.MsgShareOpen[hh['lang']]}{Msg.Success[hh['lang']]}, Id: {share.id}, IP: {hh['ip']}")
        else:
            logger.warning(f"{share.name} - {Msg.MsgShareTimes[hh['lang']]}, Id: {share.id}, IP: {hh['ip']}")
            result = {'type': 404}
    except:
        logger.error(traceback.format_exc())
        result = {'type': 404}
    return result


async def upload_image(query, hh: dict) -> Result:
    result = Result()
    query = await query.form()
    folder_path = os.path.join(path, 'web/img/pictures', hh['u'])
    if not os.path.exists(folder_path):
        os.mkdir(folder_path)
    file_path = os.path.join(folder_path, 'background.jpg')
    data = query['file'].file
    try:
        with open(file_path, 'wb') as f:
            f.write(data.read())
        result.msg = f"{Msg.MsgUpload[hh['lang']].format(query['file'].filename)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}, content_type: {query['file'].content_type}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgUpload[hh['lang']].format(query['file'].filename)}{Msg.Failure[hh['lang']]}"
        logger.error(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
        logger.error(traceback.format_exc())
    return result


async def save_txt_file(query: models.SaveFile, hh: dict) -> Result:
    result = Result()
    try:
        async with transactions.in_transaction():
            file = await models.Files.get(id=query.id).select_related('parent')
            folder_path = await file.parent.get_all_path()
            with open(os.path.join(folder_path, file.name), 'w', encoding='utf-8') as f:
                f.write(query.data)
            file.size = os.path.getsize(os.path.join(folder_path, file.name))
            await file.save()
        result.msg = f"{Msg.MsgSave[hh['lang']].format(file.name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file.id, hh['u'], hh['ip'])}")
    except FileNotFoundError as msg:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = msg.args[0]
    except:
        result.code = 1
        result.msg = f"{Msg.MsgSave[hh['lang']].format(query.id)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def export_special_file(file_id, hh: dict) -> dict:
    file = await models.Files.get(id=file_id).select_related('parent')
    parent_path = await file.parent.get_all_path()
    file_path = generate_xmind8(file.id, file.name, os.path.join(parent_path, file.name))
    result = {'path': file_path, 'name': file.name, 'format': file.format}
    logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgExport[hh['lang']].format(file.name) + Msg.Success[hh['lang']], file.id, hh['u'], hh['ip'])}")
    return result


async def save_server(query: models.ServerModel, hh: dict) -> Result:
    result = Result()
    try:
        async with transactions.in_transaction():
            datas = get_server_info(host=query.host, port=int(query.port), user=query.user, pwd=query.pwd, current_time=query.t)
            if datas['code'] == 0:
                _ = await models.Servers.create(id=query.t, host=query.host, port=query.port, user=query.user, creator=hh['u'],
                        pwd=query.pwd, system=datas['system'], cpu=datas['cpu'], mem=datas['mem'], disk=datas['disk'])
            else:
                result.code = 1
                result.msg = datas['msg']
                return result
        result.msg = f"{Msg.MsgSave[hh['lang']].format(query.host)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgSave[hh['lang']].format(query.host)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def delete_server(server_id: str, hh: dict) -> Result:
    result = Result()
    try:
        server = await models.Servers.get(id=server_id)
        await server.delete()
        await server.save()
        result.msg = f"{Msg.MsgDelete[hh['lang']].format(server.host)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgDelete[hh['lang']].format(server_id)}{Msg.Success[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_server(hh: dict) -> Result:
    result = Result()
    try:
        async with transactions.in_transaction():
            server = await models.Servers.filter(creator=hh['u'])
            server_list = [models.ServerListModel.from_orm(f).dict() for f in server]
        result.data = server_list
        result.total = len(server_list)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def upload_file_to_linux(query, hh: dict) -> Result:
    result = Result()
    try:
        query = await query.form()
        server_id = query['id']
        file_name = query['file'].filename
        remote_path = query['remotePath']
        temp_path = os.path.join('tmp', file_name)
        with open(temp_path, 'wb') as f:
            f.write(query['file'].file.read())
        remote_path = remote_path if remote_path else '/home'
        server = await models.Servers.get(id=server_id)
        upload_obj = UploadAndDownloadFile(server)
        _ = upload_obj.upload(temp_path, f'{remote_path}/{file_name}')
        os.remove(temp_path)
        del upload_obj
        result.msg = f"{Msg.MsgUpload[hh['lang']].format(file_name)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgUpload[hh['lang']].format(file_name)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def download_file_from_linux(server_id, file_path, hh: dict):
    try:
        server = await models.Servers.get(id=server_id)
        upload_obj = UploadAndDownloadFile(server)
        fp = upload_obj.download(file_path)
        del upload_obj
        logger.info(f"{Msg.CommonLog[hh['lang']].format(Msg.MsgDownload[hh['lang']].format(file_path), hh['u'], hh['ip'])}")
        return fp
    except:
        del upload_obj
        logger.error(traceback.format_exc())
        return None


async def get_mp3_info(file_id: str, hh: dict) -> Result:
    result = Result()
    try:
        file = await models.Files.get(id=file_id).select_related('parent')
        parent_path = await file.parent.get_all_path()
        file_path = os.path.join(parent_path, file.name)
        mp3_info = eyed3.load(file_path)
        result.data = {'id': file.id, 'name': file.name, 'duration': beauty_mp3_time(mp3_info.info.time_secs)}
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_all_mp3(folder_id, hh: dict) -> Result:
    result = Result()
    try:
        music_list = await models.Files.filter(Q(parent_id=folder_id) & Q(format='mp3') & Q(is_delete=0)).select_related('parent').order_by('-id')
        file_list = []
        for f in music_list:
            parent_path = await f.parent.get_all_path()
            file_path = os.path.join(parent_path, f.name)
            mp3_info = eyed3.load(file_path)
            file_list.append(models.MP3List.from_orm_format(f, beauty_mp3_time(mp3_info.info.time_secs)).dict())
        result.data = file_list
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, folder_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_mp3_history(order_by: str, hh: dict) -> Result:
    result = Result()
    try:
        page_size = 200
        if order_by == '-times':
            page_size = 100
        music_list = await models.Musics.filter(username=hh['u']).order_by(order_by).limit(page_size)
        file_list = [models.MusicList.from_orm_format(f).dict() for f in music_list]
        result.data = file_list
        result.total = len(result.data)
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog[hh['lang']].format(result.msg, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def set_mp3_history(query: models.MusicHistory, hh: dict) -> Result:
    result = Result()
    try:
        try:
            mp3 = await models.Musics.get(file_id=query.file_id)
            mp3.times = mp3.times + 1
            await mp3.save()
        except DoesNotExist:
            _ = await models.Musics.create(file_id=query.file_id, name=query.name, singer=query.singer, duration=query.duration, username=hh['u'])
        result.msg = f"{Msg.MsgMusicRecord[hh['lang']].format(query.name)}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, query.file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def delete_mp3_history(file_id, hh: dict) -> Result:
    result = Result()
    try:
        try:
            mp3 = await models.Musics.get(file_id=file_id)
            await mp3.delete()
        except DoesNotExist:
            pass
        result.msg = f"{Msg.MsgDelete[hh['lang']].format(file_id)}{Msg.Success[hh['lang']]}"
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgDelete[hh['lang']].format(file_id)}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def get_mp3_lyric(file_id: str, hh: dict) -> Result:
    result = Result()
    try:
        mp3_file = await models.Files.get(id=file_id).select_related('parent')
        parent_path = await mp3_file.parent.get_all_path()
        lrc_file_name = mp3_file.name.replace('mp3', 'lrc')
        lrc_file_path = os.path.join(parent_path, lrc_file_name)
        if os.path.exists(lrc_file_path):
            with open(lrc_file_path, 'rb') as f:
                result.data = f.read()
            result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Success[hh['lang']]}"
            logger.info(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
        else:
            result.code = 1
            result.msg = f"{Msg.MsgFileNotExist[hh['lang']].format(lrc_file_name)}"
            logger.error(f"{Msg.CommonLog1[hh['lang']].format(result.msg, file_id, hh['u'], hh['ip'])}")
    except:
        result.code = 1
        result.msg = f"{Msg.MsgQuery[hh['lang']]}{Msg.Failure[hh['lang']]}"
        logger.error(traceback.format_exc())
    return result


async def markdown_to_html(file_id: str, hh: dict) -> dict:
    result = {'name': '', 'format': '', 'data': ''}
    try:
        file = await models.Files.get(id=file_id).select_related('parent')
        parent_path = await file.parent.get_all_path()
        file_path = os.path.join(parent_path, file.name)
        with open(file_path, 'r', encoding='utf-8') as f:
            result['data'] = md_to_html(f.read())
        result['name'] = file.name.replace('.md', '.html')
        result['format'] = 'html'
        logger.info(f"{Msg.CommonLog1[hh['lang']].format(Msg.MsgExport[hh['lang']].format(file.name) + Msg.Success[hh['lang']], file_id, hh['u'], hh['ip'])}")
    except:
        logger.error(traceback.format_exc())
    return result
