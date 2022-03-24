const context = {
}

defineProperty('request', 'method')
defineProperty('request', 'header')
defineProperty('request', 'url')
defineProperty('response', 'body')

function defineProperty(target, name) {
    Object.defineProperty(context, name, {
        get() {
            return this[target][name]
        },

        set(value) {
            this[target][name] = value
        }
    })
}

module.exports = context