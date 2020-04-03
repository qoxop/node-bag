const path = require('path');

/**
 * 处理路径字符串，返回绝对路径
 * @param {string} pathname 
 * @param {string =} cwd 
 */
function getAbsolutePath(pathname, cwd) {
    if (pathname.indexOf('/') !== 0) {
        return path.resolve(cwd || path.dirname(getCallerPath(1)), pathname);
    }
    return pathname;
}

/**
 * 获取调用函数路径
 * @param {Number} 调用栈 
 */
function getCallerPath(c) {
    var origPrepareStackTrace = Error.prepareStackTrace
    Error.prepareStackTrace = function (_, stack) {
        return stack
    }
    var err = new Error()
    var stack = err.stack
    Error.prepareStackTrace = origPrepareStackTrace
    stack.shift();
    stack.shift();
    return stack[0 + (c || 0)].getFileName();
}

module.exports = {
    getCallerPath,
    getAbsolutePath,
}