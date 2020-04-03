const path = require('path');
const fs = require('fs');

/**
 * 扫描一个目录，返回文件列表，目录列表，和文件树
 * @param {string} absPath 绝对路径
 * @param {object} options 配置项
 * @returns {list: string[], tree: {key: Stat|tree}}
 */
module.exports = function scanner(absPath, options) {
    options = Object.assign({excludes: []}, (options || {}));
    const list = [];
    const dirList = [];
    const tree = {};
    const readdir = (dir, _tree) => {
        dirList.push(dir)
        try {
            let files = fs.readdirSync(dir, {encoding: 'utf8'});
            if (options.excludes && options.excludes.length > 0) {
                files = files.filter((file) => !(options.excludes).some(item => item.test(file)))
            }
            files.forEach(file => {
                const filepath = path.resolve(dir, file);
                const fileStat = fs.statSync(filepath);
                if (fileStat.isDirectory()) {
                    _tree[file] = {};
                    readdir(filepath, tree[file])
                } else if (fileStat.isFile()) {
                    list.push(filepath)
                    _tree[file] = fileStat;
                } 
            })
        } catch (err) {
            throw (err)
        }
    }
    readdir(absPath, tree);
    return {list, dirList, tree}
}