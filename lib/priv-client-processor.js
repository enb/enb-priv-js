module.exports = {
    /**
     * Adapts single priv file content to client-side.
     * @param {String} input
     * @param {Boolean} [keepRequires]
     * @returns {String}
     */
    process: function (input, keepRequires) {
        var result = input
            .replace(/module\.exports\s*=\s*function\s*\([^\)]*\)\s*{/, '')
            .replace(/\}\s*(?:;)?\s*$/, '');

        if (!keepRequires) {
            result = result.replace(/\s*((var|,)?\s+.+\s*=\s*require\(.+\)(,|;)?)/ig, '');
        }

        return result;
    },

    /**
     * Builds module (see npm package "ym").
     * @param {String} privEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @returns {string}
     */
    buildModule: function (privEngineSource, inputSources, dependencies) {
        var libNames,
            depNames,
            libPrepares;

        if (dependencies) {
            libNames = Object.keys(dependencies);
            libPrepares = libNames.map(function (libName) {
                return 'blocks.lib.' + libName + ' = ' + libName + ';';
            });
            depNames = libNames.map(function (libName) {
                return dependencies[libName];
            });
        }

        depNames = depNames && depNames.length ? ', ' + JSON.stringify(depNames) : '';
        libNames = libNames && libNames.length ? ', ' + libNames.join(', ') : '';
        libPrepares = libPrepares && libPrepares.length ? libPrepares.join('\n') : '';

        return [
            'modules.define(\'blocks\'' +
            depNames +
            ', function (provide' + libNames + ') {',
            privEngineSource,
            '',
            'var blocks = new Blocks();',
            '',
            libPrepares,
            '',
            inputSources,
            '',
            'provide(blocks);',
            '});'
        ].join('\n');
    },

    /**
     * Builds client js.
     * @param {String} privEngineSource
     * @param {String} inputSources
     * @param {Object} dependencies example: {libName: "dependencyName"}
     * @returns {string}
     */
    build: function (privEngineSource, inputSources, dependencies) {
        var libNames,
            libPrepares;

        if (dependencies) {
            libNames = Object.keys(dependencies);
            libPrepares = libNames.map(function (libName) {
                return 'blocks.lib.' + libName + ' = ' + dependencies[libName] + ';';
            });
        }

        if (libPrepares && libPrepares.length) {
            libPrepares = [
                'blocks.lib = {};',
                libPrepares.join('\n')
            ].join('\n');
        }

        return [
            privEngineSource,
            '',
            'var blocks = new Blocks();',
            '',
            libPrepares,
            '',
            inputSources
        ].join('\n');
    }
};

