var Blocks = (function () {
    'use strict';
    function Blocks() {
        this._methods = {};
        this.lib = {};
    }

    Blocks.prototype.declare = function (name, method) {
        if (!name || typeof name !== 'string') {
            throw new TypeError('Argument `name` must be a string');
        }

        if (method === null || method === undefined) {
            throw new TypeError('Argument `method` must not be Null or undefined');
        }

        this._methods[name] = method;

        return this;
    };

    Blocks.prototype.decl = Blocks.prototype.declare;
    Blocks.prototype.get = function (name) {
        if (!name || typeof name !== 'string') {
            throw new TypeError('Argument `name` must be a string');
        }

        var method = this._methods[name];

        if (!method) {
            throw new Error('Priv method `' + name + '` was not declared');
        }

        return method;
    };

    Blocks.prototype.exec = function (name) {
        return name;
    };

    return Blocks;
})();

if (typeof module !== 'undefined') {
    module.exports = Blocks;
}
