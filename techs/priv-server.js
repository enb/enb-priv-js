/**
 * priv-server
 * ===========
 *
 * Склеивает *priv*-файлы по deps'ам с помощью набора `require` в виде `?.priv.js`.
 * Предназначен для сборки серверного priv-кода. После сборки требуется наличия всех файлов,
 * подключённых с помощью набора `require`.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.priv.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 *   (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *Array* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['priv.js'].
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-priv-js/techs/priv-server'));
 * ```
 */
var path = require('path');

module.exports = require('enb/lib/build-flow').create()
    .name('priv-server')
    .target('target', '?.priv.js')
    .defineOption('privFile', '')
    .useFileList(['priv.js'])
    .needRebuild(function (cache) {
        this._privFile = this._privFile ?
            path.join(this.node._root, this._privFile) :
            require.resolve('priv-js/lib/priv.js');
        return cache.needRebuildFile('bh-file', this._privFile);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('priv-file', this._privFile);
    })
    .builder(function (privFiles) {
        var node = this.node;
        /**
         * Генерирует `require`-строку для подключения исходных priv-файлов.
         *
         * @param {String} absPath
         * @param {String} pre
         * @param {String} post
         */
        function buildRequire(absPath, pre, post) {
            var relPath = node.relativePath(absPath);
            return [
                'dropRequireCache(require, require.resolve("' + relPath + '"));',
                (pre || '') + 'require("' + relPath + '")' + (post || '') + ';'
            ].join('\n');
        }

        var dropRequireCacheFunc = [
            'function dropRequireCache(requireFunc, filename) {',
            '    var module = requireFunc.cache[filename];',
            '    if (module) {',
            '        if (module.parent) {',
            '            if (module.parent.children) {',
            '                var moduleIndex = module.parent.children.indexOf(module);',
            '                if (moduleIndex !== -1) {',
            '                    module.parent.children.splice(moduleIndex, 1);',
            '                }',
            '            }',
            '            delete module.parent;',
            '        }',
            '        delete module.children;',
            '        delete requireFunc.cache[filename];',
            '    }',
            '};'
        ].join('\n');

        return [
            dropRequireCacheFunc,
            buildRequire(this._privFile, 'var Blocks = '),
            'var blocks = new Blocks();',
            privFiles.map(function (file) {
                return buildRequire(file.fullname, '', '(blocks)');
            }).join('\n'),
            'module.exports = blocks;'
        ].join('\n');
    })
    .createTech();
