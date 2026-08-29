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

        const settledResults = await Promise.allSettled( //Promise.allSettled能避免单文件读取错误导致整个Promise.alls失败
            result.map(async (item) => {
                const fileStat = await fs.stat(path.join(item.path, item.file));
                item.size = fileStat.size;
                item.createTime = fileStat.birthtime.toLocaleString();
                return item;
            })
        );
        return settledResults.filter(item => item.status === 'fulfilled').map(item => item.value);
    } catch (err) {
        return result.length > 0 ? result : null;
    }
}

/**
 * 写入文件
 * @param {string|Array<string>} filePath 存储路径，若为数组则是路径目录
 * @param {*} data 写入数据
 * @param {*} format 传入数据格式，如 base64
 * @returns 
 */
export async function saveFile(filePath, data, format = "") {
    if (format == "base64") data = Buffer.from(data, 'base64');

    //确保文件夹存在
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return fs.writeFile(filePath, data);//writeFile的 { recursive: true } 设置不生效，不知为什么
}

/**
 * 确保路径存在
 * @param {*} dir 
 */
export async function accessDir(dir) {
    // const dirName = path.dirname(dir);
    await fs.mkdir(dir, { recursive: true });
    return dir;
}

/**
 * 用流写
 * @param {*} stream 
 * @param {*} chunk 
 */
export async function writeOnStream(stream, chunk) {
    if (chunk == null) return;

    // 尝试写入，检查返回值
    const canContinue = stream.write(chunk);

    // 如果返回 false，说明缓冲区已满，需要等待 'drain' 事件
    if (!canContinue) {
        await new Promise((resolve, reject) => {
            // 监听 'drain'，同时监听 'error' 防止永久等待
            const onDrain = () => {
                stream.removeListener('error', onError);
                resolve();
            };
            const onError = (err) => {
                stream.removeListener('drain', onDrain);
                reject(err);
            };
            stream.once('drain', onDrain);
            stream.once('error', onError);
        });
    }
} 