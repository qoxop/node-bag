
interface Options {
    autoEmit?: boolean,
    delay?: boolean,
    excludes?: RegExp[]
}

interface Result {
    list: string,
    dirList: string,
    changeMapper: {
        [filepath: string]: {
            filepath: string,
            modifyTime: number,
            eventType: 'delete' | 'create' | 'change',
            type: 'file' | 'dir'
        }
    },
    times: number
}
declare class Watcher {
    /**
     * 监听文件变化，onChange方法可以获取得到变化后的文件列表(list)，目录列表(dirList)和变化文件描述changeMapper
     * @constructor
     * @param {Options} options 配置项
     * @param {Boolean =} options.autoEmit
     * @param {Number =} options.delay 节流时间(防止触发频率过高)
     * @param {RegExp[] =} options.excludes 过滤需要的文件名的正则表达式列表
     */
    constructor(options?: Options): Watcher
    watch(dirPath: string): Watcher;
    onChange(callback?: (result: Result) => void): Watcher;
    close(): Watcher;
}

export default Watcher
