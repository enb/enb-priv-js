var vow = require('vow'),
    vfs = require('enb/lib/fs/async-fs'),
    compile = require('../lib/compiler').compile;

/**
 * @class PrivBundleTech
 * @augments {BaseTech}
 * @classdesc
 *
 * Build file with CommonJS requires for core and each Priv template (`priv.js` files).<br/><br/>
 *
 * Use in browsers and on server side (Node.js).<br/><br/>
 *
 * The compiled Priv module supports CommonJS and YModules. If there is no any modular system in the runtime,
 * the module will be provided as global variable `blocks`.<br/><br/>
 *
 * Important: do not use `require` in templates.
 *
 * @param {Object}      [options]                           Options
 * @param {String}      [options.target='?.priv.js']        Path to a target with compiled file.
 * @param {String}      [options.filesTarget='?.files']     Path to a target with FileList.
 * @param {String[]}    [options.sourceSuffixes='priv.js']  Files with specified suffixes involved in the assembly.
 * @param {String}      [options.coreFileName]              Path to file with Priv core.
 * @param {Object}      [options.requires]                  Names for dependencies to `blocks.lib.name`.
 *
 * @example
 * var PrivBundleTech = require('enb-priv-js/techs/priv-bundle'),
 *     FileProvideTech = require('enb/techs/file-provider'),
 *     bemTechs = require('enb-bem-techs');
 *
 * module.exports = function(config) {
 *     config.node('bundle', function(node) {
 *         // get FileList
 *         node.addTechs([
 *             [FileProvideTech, { target: '?.bemdecl.js' }],
 *             [bemTechs.levels, levels: ['blocks']],
 *             bemTechs.deps,
 *             bemTechs.files
 *         ]);
 *
 *         // build Priv file
 *         node.addTech(PrivBundleTech);
 *         node.addTarget('?.priv.js');
 *     });
 * };
 */
module.exports = require('enb/lib/build-flow').create()
    .name('priv-bundle')
    .target('target', '?.priv.js')
    .defineOption('coreFileName', require.resolve('priv-js/lib/priv.js'))
    .defineOption('requires', {})
    .useFileList(['priv.js'])
    .needRebuild(function (cache) {
        return cache.needRebuildFile('priv-core-file', this._coreFileName);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('priv-core-file', this._coreFileName);
    })
    .builder(function (files) {
        return this._readTemplates(files)
            .then(function (sources) {
                return this._compile(sources);
            }, this);
    })
    .methods(/** @lends PrivBundleTech.prototype */{
        /**
         * Compiles code of Priv module with core and source templates.
         *
         * @see PrivCompiler.compile
         * @protected
         * @param {Array.<{path: String, contents: String}>} sources — Files with source templates.
         * @returns {String} compiled code of priv module
         */
        _compile: function (sources) {
            var opts = {
                dirname: this.node.getDir(),
                coreFileName: this._coreFileName,
                requires: this._requires
            };

            return compile(sources, opts);
        },
        /**
         * Reads files with source templates.
         *
         * @protected
         * @param {FileList} files
         * @returns {Array.<{path: String, relPath: String, contents: String}>}
         */
        _readTemplates: function (files) {
            var node = this.node,
                process = this._processTemplate;

            return vow.all(files.map(function (file) {
                return vfs.read(file.fullname, 'utf8')
                    .then(function (contents) {
                        return {
                            path: file.fullname,
                            relPath: node.relativePath(file.fullname),
                            contents: process(contents)
                        };
                    });
            }));
        },
        /**
         * Adapts single Priv file content to client side.
         *
         * @protected
         * @param {String} contents — Contents of a source file.
         * @returns {String}
         */
        _processTemplate: function (contents) {
            return contents
                .replace(/\s*((var|,)?\s+.+\s*=\s*require\(.+\)(,|;)?)/ig, '')
                .replace(/module\.exports\s*=\s*function\s*\([^\)]*\)\s*\{/, '')
                .replace(/}\s*(?:;)?\s*$/, '');
        }
    })
    .createTech();
