import {Duplex} from 'stream'

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
function dirDeepClearSync(dirPath: string, onerror?: (e: Error) => void): boolean;

/**
 * 尝试读取文件并生成一个双工流duplex
 * @param {string} filePath 
 * @param {onerrorCallback} onerror 
 */
function duplexFileStream(filePath: string, onerror?: (e: Error) => void): Duplex;

export {
    dirDeepClearSync,
    duplexFileStream,
}