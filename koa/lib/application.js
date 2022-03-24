const http = require('http')
const { Stream } = require('stream')
const context = require('./context')
const request = require('./request')
const response = require('./response')

class Application {
    constructor() {
        this.middleware = []

        this.context = Object.create(context)
        this.request = Object.create(request)
        this.response = Object.create(response)
    }

    listen(...args) {
        const server = http.createServer(this.callback())

        server.listen(...args)
    }

    use(fn) {
        this.middleware.push(fn)
    }

    // 异步递归遍历调用中间件处理函数
    compose(middleware) {
        return function (context) {
            const dispatch = index => {
                if (index >= middleware.length) {
                    return Promise.resolve()
                }

                const fn = middleware[index]

                return Promise.resolve(fn(context, () => dispatch(index + 1)))
            }

            // 返回第一个中间件处理函数
            return dispatch(0)
        }
    }

    // 构造上下文对象
    createContext(req, res) {
        // 一个实例会处理多个请求，而不同的请求应该拥有不同的上下文对象
        // 为了避免请求期间的数据交叉污染，这里又对这个数据做了一份新的拷贝
        const context = Object.create(this.context)
        const request = (context.request = Object.create(this.request))
        const response = (context.response = Object.create(this.response))

        context.app = request.app = response.app = this
        context.req = request.req = response.req = req
        context.res = request.res = response.res = res

        request.ctx = response.ctx = context
        request.response = response
        response.request = request

        context.originalUrl = request.originalUrl = req.url

        context.state = {}

        return context
    }

    callback() {
        const fnMiddleware = this.compose(this.middleware)

        const handleRequest = (req, res) => {
            // 每个请求都会创建一个独立的 context 上下文对象
            // 它们之间不会互相污染
            const context = this.createContext(req, res)

            fnMiddleware(context).then(() => {
                respond(context)
            }).catch(err => {
                res.end(err.message)

                console.log('err', err)
            })
        }

        return handleRequest
    }
}

function respond(ctx) {
    const { body, res } = ctx

    if (body === null) {
        res.statusCode = 204
        return res.end()
    }

    if (typeof body === 'string'
        || Buffer.isBuffer(body)
    ) {
        return res.end(body)
    }

    if (body instanceof Stream) {
        return body.pipe(res)
    }

    if (typeof body === 'number') {
        return res.end(body + '')
    }

    if (typeof body === 'object') {
        return res.end(JSON.stringify(body))
    }
}

module.exports = Application