
/**
 * 处理路径字符串，返回绝对路径
 * @param {string} pathname 
 * @param {string =} cwd 
 */
declare function getAbsolutePath(pathname: string, cwd?: string): string

/**
 * 获取调用函数路径
 * @param {Number} 调用深度
 */
declare function name(c?: number): string

export {
    getAbsolutePath,
    name
}