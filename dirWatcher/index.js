const path = require('path');
const fs = require('fs');
const os = require('os');
const Event = require('events');
const pathHelper = require('../pathHelper')
const scanner = require('./dirScanner');
class Emitter extends Event {};


const isWinOrMac = os.platform() === 'darwin' || os.platform() === 'win32';

/**
 * 监听文件变化，onChange方法可以获取得到变化后的文件列表(list)，目录列表(dirList)和变化文件描述changeMapper
 * @constructor
 * @param {Object} options 配置项
 * @param {string =} options.autoEmit
 * @param {string =} options.delay 节流时间(防止触发频率过高)
 * @param {RegExp[] =} options.excludes 过滤需要的文件名的正则表达式列表
 * @returns Watcher
 */
function Watcher(options = {}) {
    const emitter = new Emitter();
    options = Object.assign({excludes: [/^\./], delay: 500, autoEmit: true}, options);
    let list = [];
    let dirList = [];
    let times = 0;
    let changeMapper = {};
    let watchMapper = {};
    let timeoutId = 0;
    let watched = false;
    const watchHandler = (eventType, filename, basePath) => {
        const fileKey = path.resolve(basePath, filename);
        const now = (new Date()).getTime();
        changeMapper[fileKey] = {
            filepath: fileKey,
            modifyTime: now,
            eventType: eventType,
            type: 'file'
        }
        if (eventType === 'rename') {
            if (list.some(item => item === fileKey)) { // 删除文件
                changeMapper[fileKey].eventType = 'delete';
                list = list.filter(item => item !== fileKey);
            } else if (dirList.some(item => item === fileKey)) { // 删除目录
                emitter.emit('dirDelete', fileKey)
                changeMapper[fileKey].eventType = 'delete';
                changeMapper[fileKey].type = 'dir';
                list.filter(item => item.indexOf(fileKey) === 0).forEach(key => {
                    changeMapper[key] = {
                        filepath: key,
                        modifyTime: now,
                        eventType: 'delete',
                        type: 'file'
                    }
                })
                list = list.filter(item => item.indexOf(fileKey) !== 0);
                dirList = dirList.filter(item => item !== fileKey);
            } else {
                const stat = fs.statSync(fileKey);
                if (stat.isFile()) { // 添加文件
                    list.push(fileKey);
                    changeMapper[fileKey].eventType = 'create';
                } else if (stat.isDirectory()) { // 添加\重命名目录
                    emitter.emit('dirCreate', fileKey)
                    changeMapper[fileKey].eventType = 'create';
                    changeMapper[fileKey].type = 'dir';
                    const dirData = scanner(fileKey, options);
                    list = list.concat(dirData.list);
                    dirList = dirList.concat(dirData.dirList);
                    dirData.list.forEach(key => {
                        changeMapper[key] = {
                            filepath: key,
                            modifyTime: now,
                            eventType: 'create',
                            type: 'file'
                        }
                    })
                }
            }
        }
        clearTimeout(timeoutId); // 节流
        timeoutId = setTimeout(() => {
            emitter.emit('change', {list, dirList, changeMapper, times: ++times})
            changeMapper = {}; // 重置
        }, options.delay || 500)
    }
    function watch(rPath) {
        if (watched) {
            console.warn('don\'t call watch twice!, please close first!');
            return this;
        }
        watched = true;
        rPath = pathHelper.handlePath(rPath)
        const res = scanner(rPath, options);
        list = res.list;
        dirList = res.dirList;
        if (isWinOrMac) { // windows 和 macos 支持监听多级目录
            watchMapper[rPath] = fs.watch(rPath, {recursive: true}, (eventType, filename) => {
                watchHandler(eventType, filename, rPath)
            })
        } else {
            try {
                dirList.forEach(p => {
                    watchMapper[p] = fs.watch(p, { recursive: false}, () => {
                        watchHandler(eventType, filename, p)
                    })
                })
            } catch (error) {
                console.warn(error)
            }
            emitter.on('dirDelete', (dirPath) => {
                if (watchMapper[dirPath]) {
                    try {
                        watchMapper[dirPath].close();
                        delete watchMapper[dirPath];
                    } catch (error) {
                        console.warn(error)
                    }
                    
                }
            })
            emitter.on('dirCreate', (dirPath) => {
                try {
                    watchMapper[dirPath] = fs.watch(dirPath, { recursive: false}, () => {
                        watchHandler(eventType, filename, dirPath)
                    })
                } catch (error) {
                    console.warn(error)
                }
                
            })
        }
        if (options.autoEmit) {
            setTimeout(() => {
                emitter.emit('change', {list, dirList, changeMapper, times: ++times})
            }, 10);
            
        }
        return this;
    }
    function onChange(callback) {
        emitter.on('change', callback);
        return this;
    }
    function close() {
        try {
            emitter.removeAllListeners('change');
            emitter.removeAllListeners('dirDelete');
            emitter.removeAllListeners('dirCreate');
            list = [];
            dirList = [];
            times = 0;
            changeMapper = {};
            watchMapper = {};
            watched = false;
            for (const k in watchMapper) {
                try {
                    watchMapper[k].close();
                } catch (error) {
                    console.warn('关闭文件监听器：', error)
                }
            }
        } catch (error) {
            console.warn('关闭文件监听器：', error)
        }
        return this;
    }
    this.watch = watch.bind(this);
    this.onChange = onChange.bind(this);
    this.close = close.bind(this);
}

const clearFile = (rPath) => {
    rPath = pathHelper.handlePath(rPath);
    const stat = fs.statSync(rPath);
    if (stat.isDirectory()) {
        try {
            const files = readdirSync(rPath, {encoding: 'utf8'});
            files.forEach(file => {
                const filePath = path.resolve(rPath, file);
                const _stat = fs.statSync(filePath);
                if (_stat.isDirectory()) {
                    clearFile(filePath);
                } else {
                    fs.unlinkSync(filePath)
                }
            })
        } catch (e) {
            throw e;
        }
    } else if (stat.isFile()) {
        try {
            fs.unlinkSync(rPath)
        } catch (error) {
            throw e;
        }
    }
}

module.exports = Watcher