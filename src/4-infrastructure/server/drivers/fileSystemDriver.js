// src/4-infrastructure/server/fileSystemUtils.js
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * 扫描指定目录下的所有文件，返回文件名数组
 */
export async function listFilesInDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // 目录不存在时返回空数组，不抛出异常（业务层可决定如何处理）
      return [];
    }
    throw error;
  }
}

/**
 * 在目录中查找匹配指定基名的文件，返回完整文件名
 * # 即可以通过文件名确认后缀
 */
export async function findFileByBasename(dirPath, basename) {
  const files = await listFilesInDirectory(dirPath);
  for (const file of files) {
    const { name } = path.parse(file);
    if (name === basename) {
      return file;
    }
  }
  return null;
}

/**
 * 按后缀类型，列出指定目录下符合要求的文件
 * @param {*} sourcePath 指定的路径
 * @param {*} options 
 * @returns 
 */
export async function listFiles(sourcePath, options = { filetype: null, detail: false }) {
  let result = [];
  try {
    await fs.access(sourcePath);

    const dir = await fs.opendir(sourcePath);
    for await (const dirent of dir) {
      if (!dirent.isFile()) continue;
      let { ext, name } = path.parse(dirent.name);
      ext = ext.replace(/^\./, "").toLowerCase();
      let item = {
        file: dirent.name,
        path: dirent.parentPath,
        name: name,
        ext: ext,
      }
      if (!options?.filetype) {
        result.push(item);
      } else {
        if (options?.filetype.includes(ext)) result.push(item);
      }
    }

    if (!options?.detail) return result.map(item => item.name);

    return await Promise.all( //注意：如果单文件读取错误将导致整个Promise.alls失败
      result.map(async (item) => {
        const fileStat = await fs.stat(path.join(item.path, item.file));
        item.size = fileStat.size;
        item.createTime = fileStat.birthtime.toLocaleString();
        return item;
      })
    );
  } catch (err) {
    return result.length > 0 ? result : null;
  }
}