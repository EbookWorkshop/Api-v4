import fs from "node:fs";
import path from "node:path";

// 从命令行参数获取根目录和输出文件名
const rootDir = process.argv[2] || '.';
const outputFile = process.argv[3] || 'combined.txt';

// 需要忽略的目录
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', ".vscode", "docs", "scripts", "test"];

// 要包含的文件扩展名（按需增删）
const includeExts = [
  '.js', '.ts', '.jsx', '.tsx',
  '.json', //'.md',
  '.html', '.css', '.scss', '.less',
  '.vue', '.svelte', '.cjs', '.mjs'
];

// 递归遍历目录，收集符合条件的文件路径（相对路径）
function walkDir(dir, relativeBase = '') {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(relativeBase, entry.name);

    if (entry.isDirectory()) {
      if (ignoreDirs.includes(entry.name)) continue;
      results = results.concat(walkDir(fullPath, relPath));
    } else {
      const ext = path.extname(entry.name);
      if (includeExts.includes(ext)) {
        results.push(relPath);
      }
    }
  }
  return results;
}

// 收集所有符合条件的文件
const files = walkDir(rootDir);
console.log(`找到 ${files.length} 个文件，开始合并...`);

// 写入合并文件
const outStream = fs.createWriteStream(outputFile);

for (const relPath of files) {
  const fullPath = path.join(rootDir, relPath);
  // 标记文件起始位置（保留路径）
  outStream.write(`\n\n// ----- ${relPath} -----\n\n`);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    outStream.write(content);
    outStream.write('\n');
  } catch (err) {
    console.warn(`跳过无法读取的文件：${relPath}`, err.message);
  }
}

outStream.end(() => {
  console.log(`合并完成，输出文件：${outputFile}`);
});