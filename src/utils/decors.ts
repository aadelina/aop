import * as glob from 'glob';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as  Parameter from 'parameter'
import * as Schema from 'async-validator';

type HTTPMethod = 'get' | 'put' | 'del' | 'post' | 'patch'

type LoadOptions = {
    extname?: string
}

type RouteOptions = {
    prefix?: string;
    middlewares?: Array<Koa.Middleware>
}

const router = new KoaRouter()
const decorate = (method: HTTPMethod, path: string, options: RouteOptions = {}, router: KoaRouter) => {
    return (target, property: string) => {
        process.nextTick(() => {
            // 添加中间件数组
            const middlewares = []
            if (options.middlewares) {
                middlewares.push(...options.middlewares)
            }

            if (target.middlewares) {
                middlewares.push(...target.middlewares)
            }

            middlewares.push(target[property])
            const url = options.prefix ? options.prefix + path : path
            // router[method](url, target[property])
            router[method](url, ...middlewares)
        })

    }
}
const method = method => (path: string, options?: RouteOptions) => decorate(method, path, options, router)
export const get = method('get')
export const post = method('post')
export const put = method('put')
export const del = method('del')



export const load = (folder: string, options: LoadOptions = {}): KoaRouter => {
    const extname = options.extname || '.{js,ts}'
    glob.sync(require('path').join(folder, `./**/*${extname}`)).forEach((item) => require(item))
    return router
}




export const verifyData = (validata) => (target, name, descriptor) => {
    const oldValue = descriptor.value
    descriptor.value = async function () {
        
        const argus = [...arguments]
        // console.log(argus)
        //请求接口方式
        const method = argus[0].request.method; 
        const pram = argus[0].request.body
        var validator = new Schema(validata);
        validator.validate(pram, (errors, fields) => {
            if (errors) {
                //  校验失败
                console.log(errors)
            } else {
                //校验成功
                return oldValue.apply(null, arguments);
            }
        });
    }
}
