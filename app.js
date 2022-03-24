const Koa = require('./koa')

const app = new Koa()

const one = (ctx, next) => {
    console.log('>>>> one')
    next()
    console.log('<<<< one')
}

const two = (ctx, next) => {
    console.log('>>>> two')
    next()
    console.log('<<<< two')
}

const three = (ctx, next) => {
    console.log('>>>> three')
    next()
    console.log('<<<< three')
}

app.use((ctx, next) => {
    // console.log(ctx.request.header)
    // console.log(ctx.request.method)

    // console.log(ctx.header)

    ctx.body = 'koa'

    next()
})

app.use((ctx, next) => {
    console.log(ctx.body)
})

// app.use(one)
// app.use(two)
// app.use(three)

app.listen(3000)