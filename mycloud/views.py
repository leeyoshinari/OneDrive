#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Author: leeyoshinari

import os
import time
import json
import shutil
import zipfile
import traceback
from tortoise import transactions
from tortoise.expressions import Q
from tortoise.exceptions import DoesNotExist
from . import models
from settings import get_config, path
from common.results import Result
from common.messages import Msg
from common.logging import logger
from common.calc import calc_md5, calc_file_md5
from common.xmind import read_xmind, create_xmind, generate_xmind8
from common.sheet import read_sheet, create_sheet


root_path = json.loads(get_config("rootPath"))


async def create_file(folder_id: str, file_type: str, hh: dict) -> Result:
    result = Result()
    try:
        if len(folder_id) == 1:
            folder_id = folder_id + hh['u']
        if len(folder_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon
            return result
        folder = await models.Catalog.get(id=folder_id)
        folder_path = await folder.get_all_path()
        async with transactions.in_transaction():
            file_id = str(int(time.time() * 10000))
            if file_type == 'md':
                file_name = '新建markdown文档.md'
            elif file_type == 'xmind':
                file_name = '新建脑图文件.xmind'
            elif file_type == 'sheet':
                file_name = '新建sheet工作表.sheet'
            elif file_type == 'docu':
                file_name = '新建doc文档.docu'
            else:
                file_name = '新建文本文件.txt'
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
        logger.info(f"{files.name} 新建成功, 用户: {hh['u']}, IP: {hh['ip']}")
        result.data = files.id
        result.msg = f"{files.name} 新建成功"
    except FileExistsError:
        result.code = 1
        result.msg = "文件已存在"
    except:
        logger.error(traceback.format_exc())
        logger.error(f"新建{file_type}文件失败, 用户: {hh['u']}, IP: {hh['ip']}")
        result.code = 1
        result.msg = f'新建{file_type}文件失败'
    return result


async def get_all_files(parent_id: str, query: models.SearchItems, hh: dict) -> Result:
    """获取目录下的所有文件"""
    result = Result()
    try:
        if len(parent_id) == 1:
            parent_id = parent_id + hh['u']
        if len(parent_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon
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
        logger.info(f"{Msg.MsgGetFileSuccess}, 文件夹ID: {parent_id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.data = folder_list + file_list
        result.total = len(result.data)
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgGetFileFailure
    return result


async def create_folder(parent_id: str, hh: dict) -> Result:
    result = Result()
    try:
        if len(parent_id) == 1:
            parent_id = parent_id + hh['u']
        if len(parent_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon
            return result
        async with transactions.in_transaction():
            folder = await models.Catalog.create(id=str(int(time.time() * 10000)), name='新建文件夹', parent_id=parent_id)
            folder_path = await folder.get_all_path()
            if os.path.exists(folder_path):
                raise FileExistsError
            else:
                os.mkdir(folder_path)
        result.data = folder.id
        result.msg = Msg.MsgCreateSuccess.format(folder.name)
        logger.info(f"{Msg.MsgCreateSuccess.format(folder.name)}, 文件夹ID: {folder.id}, 用户: {hh['u']}, IP: {hh['ip']}")
    except FileExistsError:
        result.code = 1
        result.msg = "文件夹已存在"
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgCreateFailure.format("")
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
        logger.info(f"{Msg.MsgRenameSuccess.format(query.name)}, 文件夹ID: {folder.id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.data = query.id
        result.msg = Msg.MsgRenameSuccess.format(query.name)
    except FileExistsError:
        result.code = 1
        result.msg = "文件夹重名，请重写输入 ~"
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgRenameFailure.format(query.name)
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
        logger.info(f"{Msg.MsgRenameSuccess.format(file.name)}, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.data = query.id
        result.msg = Msg.MsgRenameSuccess.format(file.name)
    except FileExistsError:
        result.code = 1
        result.msg = "文件重名，请重写输入 ~"
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgRenameFailure.format(query.name)
    return result


async def copy_file(file_id: str, hh: dict) -> Result:
    result = Result()
    try:
        file = await models.Files.get(id=file_id).select_related('parent')
        folder_path = await file.parent.get_all_path()
        file_name_list = file.name.split('.')
        file_name = f"{file.name.replace(f'.{file_name_list[-1]}', '')} - 副本.{file_name_list[-1]}"
        async with transactions.in_transaction():
            new_file = await models.Files.create(id=str(int(time.time() * 10000)), name=file_name, format=file.format,
                                                 parent_id=file.parent_id, size=file.size, md5='0')
            if os.path.exists(os.path.join(folder_path, file_name)):
                raise FileExistsError
            shutil.copy2(os.path.join(folder_path, file.name), os.path.join(folder_path, file_name))
        logger.info(f"{Msg.MsgCopySuccess.format(file.name)}, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.data = new_file.id
        result.msg = Msg.MsgCopySuccess.format(file.name)
    except FileExistsError:
        result.code = 1
        result.msg = "文件副本已经存在 ~"
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgCopyFailure.format('')
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
                    logger.info(f"{Msg.MsgDeleteSuccess.format(folder.name)}, 文件夹ID: {folder.id}, 用户: {hh['u']}, IP: {hh['ip']}")
            if query.file_type == 'file':
                for file_id in query.ids:
                    file = await models.Files.get(id=file_id)
                    file.is_delete = query.is_delete
                    await file.save()
                    logger.info(f"{Msg.MsgDeleteSuccess.format(file.name)}, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")

        if query.delete_type == 1 or query.delete_type == 2:       # 硬删除，从回收站彻底删除
            if query.file_type == 'folder':
                folders = await models.Catalog.filter(id__in=query.ids)
                for folder in folders:
                    try:
                        async with transactions.in_transaction():
                            folder_path = await folder.get_all_path()
                            await folder.delete()
                            shutil.rmtree(folder_path)
                        logger.info(f"{Msg.MsgDeleteSuccess.format(folder.name)}, 文件夹ID: {folder.id}, 用户: {hh['u']}, IP: {hh['ip']}")
                    except FileNotFoundError:
                        logger.error(traceback.format_exc())
                        result.code = 1
                        result.msg = Msg.MsgNotFoundFileError.format(folder.name)
                        return result
            if query.file_type == 'file':
                files = await models.Files.filter(id__in=query.ids).select_related('parent')
                for file in files:
                    async with transactions.in_transaction():
                        file_path = await file.parent.get_all_path()
                        try:
                            os.remove(os.path.join(file_path, file.name))
                        except FileNotFoundError:
                            logger.error(traceback.format_exc())
                        await file.delete()
                    logger.info(f"{Msg.MsgDeleteSuccess.format(file.name)}, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")

        if query.delete_type == 3:      # 删除分享的文件
            _ = await models.Shares.filter(id__in=query.ids).delete()
            logger.info(f"分享文件删除成功, 用户: {hh['u']}, IP: {hh['ip']}")
        if query.delete_type == 0 and query.is_delete == 0:
            result.msg = Msg.MsgRestoreSuccess.format("")
        else:
            result.msg = Msg.MsgDeleteSuccess.format("")
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        if query.delete_type == 0 and query.is_delete == 0:
            result.msg = Msg.MsgRestoreFailure.format("")
        else:
            result.msg = Msg.MsgDeleteFailure.format("")
    return result


async def get_folders_by_id(folder_id: str, hh: dict) -> Result:
    result = Result()
    try:
        if len(folder_id) == 1:
            folder_id = folder_id + hh['u']
        if len(folder_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon
            return result
        folders = await models.Catalog.filter(parent_id=folder_id)
        folder_list = [models.CatalogGetInfo.from_orm(f) for f in folders if f.id.startswith(tuple('123456789'))]
        folder = await models.Catalog.get(id=folder_id)
        folder_path = await folder.get_all_path()
        for k, v in root_path.items():
            full_path = folder_path.replace(f"{v}/{hh['u']}", '')
            if len(folder_path) != len(full_path):
                folder_path = f"{k}:{full_path}"
                break
        logger.info(f"{Msg.MsgGetFileSuccess}, 文件夹ID: {folder_id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.data = {'folder': folder_list, 'path': folder_path}
        result.total = len(result.data['folder'])
        result.msg = Msg.MsgGetFileSuccess
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgGetFileFailure
    return result


async def move_to_folder(query: models.CatalogMoveTo, hh: dict) -> Result:
    result = Result()
    try:
        if len(query.parent_id) == 1:
            query.parent_id = query.parent_id + hh['u']
        if len(query.parent_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon
            return result
        if len(query.to_id) == 1:
            query.to_id = query.to_id + hh['u']
        if len(query.to_id) <= 3:
            result.code = 1
            result.msg = Msg.MsgAccessPermissionNon
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
        logger.info(f"{Msg.MsgMoveSuccess}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.msg = Msg.MsgMoveSuccess
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgMoveFailure
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
        result.msg = Msg.MsgAccessPermissionNon
        return result
    data = query['file'].file
    md5 = calc_md5(data)
    try:
        file = await models.Files.get(md5=md5)
        logger.info(f"{Msg.MsgFastUploadSuccess.format(file_name)}, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.code = 2
        result.data = file.name
        result.msg = Msg.MsgFastUploadSuccess.format(file_name)
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
            logger.info(f"{Msg.MsgUploadSuccess.format(file_name)}, content_type: {query['file'].content_type} 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.msg = Msg.MsgUploadSuccess.format(file_name)
        result.data = file.name
    except:
        logger.error(traceback.format_exc())
        logger.error(f"{Msg.MsgUploadFailure.format(file_name)}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.code = 1
        result.data = file_name
        result.msg = Msg.MsgUploadFailure.format(file_name)
    return result


async def upload_file_by_path(query: models.ImportLocalFileByPath) -> Result:
    try:
        to_folder = await models.Catalog.get(id=query.id)
        to_path = await to_folder.get_all_path()
        for file in os.listdir(query.path):
            file_path = os.path.join(query.path, file)
            if os.path.isfile(file_path):
                md5 = calc_file_md5(file_path)
                try:
                    _ = await models.Files.get(md5=md5)
                    logger.info(Msg.MsgFastUploadSuccess.format(file))
                    continue
                except DoesNotExist:
                    pass
                try:
                    async with transactions.in_transaction():
                        file_obj = await models.Files.create(id=str(int(time.time() * 10000)), name=file, format=file.split('.')[-1].lower(),
                                                             parent_id=to_folder.id, size=os.path.getsize(file_path), md5=md5)
                        shutil.move(file_path, to_path)
                        logger.info(Msg.MsgUploadSuccess.format(file_obj.name))
                except:
                    logger.error(traceback.format_exc())
                    logger.error(Msg.MsgUploadFailure.format(file))
            else:
                async with transactions.in_transaction():
                    folder = await models.Catalog.create(id=str(int(time.time() * 10000)), name=file, parent_id=query.id)
                    folder_path = await folder.get_all_path()
                    os.mkdir(folder_path)
                query = models.ImportLocalFileByPath(id=folder.id, path=file_path)
                await upload_file_by_path(query)
        logger.info(Msg.MsgUploadSuccess.format(query.path))
        return Result(msg=Msg.MsgUploadSuccess.format(query.path))
    except:
        logger.error(traceback.format_exc())
        return Result(code=1, msg=Msg.MsgUploadFailure.format(query.path))


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
        logger.info(f"{file.name} 查询文件信息成功, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
    except KeyError:
        result.code = 1
        result.msg = Msg.MsgFileTypeError.format(file.format)
        logger.error(traceback.format_exc())
    except:
        result.code = 1
        result.msg = Msg.MsgGetFileFailure
        logger.error(traceback.format_exc())
    return result


async def download_file(file_id: str, hh: dict) -> dict:
    file = await models.Files.get(id=file_id).select_related('parent')
    parent_path = await file.parent.get_all_path()
    result = {'path': os.path.join(parent_path, file.name), 'name': file.name, 'format': file.format}
    logger.info(f"{file.name} 查询文件信息成功, 正在下载, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
    return result


async def zip_file(query: models.DownloadFile, hh: dict) -> Result:
    result = Result()
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
        result.msg = Msg.MsgFoundFileError.format('待导出的zip文件')
        return result
    zip_multiple_file(zip_path, files, parent_path)
    file = await models.Files.create(id=str(int(time.time() * 10000)), name=f"{folder.name}.zip", format='zip', parent_id=folder.id,
                                     size=os.path.getsize(zip_path), md5=calc_file_md5(zip_path))
    result.data = file.id
    logger.info(f"{file.name} 生成成功, 正在下载, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
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
        logger.info(f"{Msg.MsgShareSuccess.format(share.name)}, 分享id: {share.id}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.msg = Msg.MsgShareSuccess.format(share.name)
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgShareFailure.format(query.id)
    return result


async def get_share_file(hh: dict) -> Result:
    result = Result()
    try:
        files = await models.Shares.all().order_by('-create_time')
        result.data = [models.ShareFileList.from_orm_format(f).dict() for f in files]
        result.total = len(result.data)
        result.msg = Msg.MsgGetFileSuccess
        logger.info(f"{Msg.MsgGetFileSuccess}, 用户: {hh['u']}, IP: {hh['ip']}")
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgGetFileFailure
    return result


async def open_share_file(share_id: int, hh: dict) -> dict:
    try:
        share = await models.Shares.get(id=share_id)
        if share.times < share.total_times:
            share.times = share.times + 1
            await share.save()
            result = {'type': 0, 'path': share.path, 'name': share.name, 'format': share.format, 'file_id': share.file_id}
            logger.info(f"{Msg.MsgShareOpen.format(share.name)}, ID: {share.id}, IP: {hh['ip']}")
        else:
            logger.warning(f"分享链接打开次数太多, 文件: {share.name}, Id: {share.id}, IP: {hh['ip']}")
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
    file_path = os.path.join(folder_path, 'back.jpg')
    data = query['file'].file
    try:
        with open(file_path, 'wb') as f:
            f.write(data.read())
        logger.info(f"{Msg.MsgUploadSuccess.format(query['file'].filename)}, content_type: {query['file'].content_type}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.msg = Msg.MsgUploadSuccess.format('图片')
    except:
        logger.error(traceback.format_exc())
        logger.error(f"{Msg.MsgUploadFailure.format(query['file'].filename)}, 用户: {hh['u']}, IP: {hh['ip']}")
        result.code = 1
        result.msg = Msg.MsgUploadFailure.format('')
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
        result.msg = Msg.MsgSaveSuccess
        logger.info(f"{file.name}保存成功, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
    except FileNotFoundError as msg:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = msg.args[0]
    except:
        logger.error(traceback.format_exc())
        result.code = 1
        result.msg = Msg.MsgSaveFailure
    return result


async def export_special_file(file_id, hh: dict) -> dict:
    file = await models.Files.get(id=file_id).select_related('parent')
    parent_path = await file.parent.get_all_path()
    file_path = generate_xmind8(file.id, file.name, os.path.join(parent_path, file.name))
    result = {'path': file_path, 'name': file.name, 'format': file.format}
    logger.info(f"{file.name} 导出成功, 文件ID: {file.id}, 用户: {hh['u']}, IP: {hh['ip']}")
    return result
