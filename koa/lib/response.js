const response = {
    _body: '',

    set status(value) {
        this.res.statusCode = value
    },

    get status() {
        return this.res.statusCode
    },

    set body(value) {
        this._body = value
    },

    get body() {
        return this._body
    }
}

module.exports = response