import * as Koa from 'koa'
import { get, post, verifyData } from '../utils/decors'
const users = [{ name: 'tom', age: 20 }]
const descriptor  = {
    token: {
        type: "string",
        required: true
      }
}

export default class User {
    @verifyData(descriptor)
    @get('/users')
    public async list(ctx: Koa.Context) {
        ctx.body = { ok: 1, data: users }
        // const users = await model.findAll()
        // ctx.body = { ok: 1, data: users };
    }

    @verifyData(descriptor)
    @post('/users')
    public add(ctx: Koa.Context) {
        users.push(ctx.request.body);
        ctx.body = { ok: 1 }
    }

}