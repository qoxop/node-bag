const fs = require('fs');
const {resolve} = require('path');
const {getAbsolutePath} = require('../pathHelper');
const {PassThrough} = require('stream')

/**
 * @callback onerrorCallback
 * @param {*} error
 */

/**
 * 同步递归地清空一个文件夹
 * @param {string} dirPath 文件夹目录
 * @param {onerrorCallback} onerror 错误回调
 * @returns {boolean} success 成功返回`true`，否则返回`false`
 */
function dirDeepClearSync(dirPath, onerror = console.warn) {
    try {
        const absPath = getAbsolutePath(dirPath);
        fs.readdirSync(absPath).forEach(file => {
            const fPath = resolve(absPath, './', file);
            const fStat = fs.statSync(fPath);
            if (fStat.isFile()) {
                fs.unlinkSync(fPath);
            } else {
                dirDeepClearSync(fPath);
            }
        })
        return true;
    } catch (error) {
        onerror(error);
        return false;
    }
}

/**
 * 尝试读取文件并生成一个双工流duplex
 * @param {string} filePath 
 * @param {onerrorCallback} onerror 
 */
function duplexFileStream(filePath, onerror = console.warn) {
    const absPath = getAbsolutePath(filePath);
    try {
        const fileStream = fs.createReadStream(absPath);
        return fileStream.on('error', onerror).pipe(new PassThrough())
    } catch (error) {
        onerror(error)
        return new PassThrough()
    }
}

module.exports = {
    dirDeepClearSync,
    duplexFileStream,
}