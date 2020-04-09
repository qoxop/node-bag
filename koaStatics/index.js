const {getAbsolutePath} = require('..//pathHelper');
const {duplexFileStream} = require('../fsHelper')
const {resolve} = require('path')
const mime = require('mime');

const statics = (urlPath, localPath) => {
    const basePath = getAbsolutePath(localPath);
    if (!/^\/.*\/$/.test(urlPath)) {
        throw('path format, urlPath should end(and start) with \'/\'');
    }
    return async (ctx, next) => {
        if (ctx.path.indexOf(urlPath) === 0) {
            const absPath = resolve(basePath, ctx.path.replace(urlPath, './'));
            ctx.set('Content-Type', [mime.getType(absPath)]);
            ctx.body = duplexFileStream(absPath, ctx.onerror);
        } else {
            await next();
        }
    }
}
module.exports = statics;
