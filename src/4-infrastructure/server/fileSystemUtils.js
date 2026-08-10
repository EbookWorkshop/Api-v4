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