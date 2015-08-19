/**
 * priv-client-module
 * ================
 *
 * Склеивает *priv*-файлы по deps'ам в виде `?.priv.client.js`. Предназначен для сборки клиентского priv-кода.
 * Использует модульную обертку.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий таргет. По умолчанию — `?.priv.client.js`.
 * * *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 *   (его предоставляет технология `files`). По умолчанию — `?.files`.
 * * *Array* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['priv'].
 *
 * **Пример**
 *
 * ```javascript
 * nodeConfig.addTech(require('enb-priv/techs/priv-client-module'));
 * ```
 */
var path = require('path'),
    vow = require('vow'),
    vfs = require('enb/lib/fs/async-fs'),
    privClientProcessor = require('../lib/priv-client-processor');

module.exports = require('enb/lib/build-flow').create()
    .name('priv-client-module')
    .target('target', '?.priv.client.js')
    .defineOption('privFile', '')
    .defineOption('dependencies', {})
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
        var node = this.node,
            dependencies = this._dependencies;

        return vow.all([
            vfs.read(this._privFile, 'utf8').then(function (data) {
                return data;
            }),
            vow.all(privFiles.map(function (file) {
                return vfs.read(file.fullname, 'utf8').then(function (data) {
                    var relPath = node.relativePath(file.fullname);
                    /**
                     * Выставляем комментарии о склеенных файлах.
                     */
                    return [
                        '// begin: ' + relPath,
                        privClientProcessor.process(data),
                        '// end: ' + relPath
                    ].join('\n');
                });
            })).then(function (sr) {
                return sr.join('\n');
            })
        ]).spread(function (privEngineSource, inputSources) {
            return privClientProcessor.buildModule(privEngineSource, inputSources, dependencies);
        });
    })
    .createTech();
