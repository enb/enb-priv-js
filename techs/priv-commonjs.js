var EOL = require('os').EOL;

/**
 * @class PrivCommonJSTech
 * @augments {BaseTech}
 * @classdesc
 *
 * Compiles CommonJS module of priv JS with requires of core and source templates (`priv.js` files).<br/><br/>
 *
 * Use in server side only (Node.js). You can use `require` in templates.<br/><br/>
 *
 * Important: for correct apply, the source files and files that are specified in `requires` should be in file system.
 *
 * @param {Object}      [options]                           Options
 * @param {String}      [options.target='?.priv.js']        Path to a target with compiled file.
 * @param {String}      [options.filesTarget='?.files']     Path to a target with FileList.
 * @param {String[]}    [options.sourceSuffixes='priv.js']  Files with specified suffixes involved in the assembly.
 * @param {String}      [options.coreFileName]              Path to file with priv core.
 * @param {Boolean}     [options.devMode=true]              Drops cache for `require` of source templates.
 *
 * @example
 * var PrivCommonJSTech = require('enb-priv-js/techs/priv-commonjs'),
 *     FileProvideTech = require('enb/techs/file-provider'),
 *     bem = require('enb-bem-techs');
 *
 * module.exports = function(config) {
 *     config.node('bundle', function(node) {
 *         // get FileList
 *         node.addTechs([
 *             [FileProvideTech, { target: '?.bemdecl.js' }],
 *             [bem.levels, levels: ['blocks']],
 *             bem.deps,
 *             bem.files
 *         ]);
 *
 *         // build priv JS file
 *         node.addTech(PrivCommonJSTech);
 *         node.addTarget('?.priv.js');
 *     });
 * };
 */
module.exports = require('enb/lib/build-flow').create()
    .name('priv-commonjs')
    .target('target', '?.priv.js')
    .defineOption('coreFileName', require.resolve('priv-js/lib/priv.js'))
    .defineOption('devMode', true)
    .useFileList(['priv.js'])
    .needRebuild(function (cache) {
        return cache.needRebuildFile('priv-core-file', this._coreFileName);
    })
    .saveCache(function (cache) {
        cache.cacheFileInfo('priv-core-file', this._coreFileName);
    })
    .builder(function (privFiles) {
        return this._compile(privFiles);
    })
    .methods({
        /**
         * Creates code of `dropRequireCache` function.
         *
         * @protected
         * @returns {String} generated code of `dropRequireCache` function.
         */
        _generateDropRequireCacheFunc: function () {
            return [
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
            ].join(EOL);
        },

        /**
         * Compiles code for `require` module.
         * In dev mode will be added code for drop cache of require.
         *
         * @param {String} varname — variable name to get a module.
         * @param {String} filename — absolute path to a module.
         * @param {Boolean} devMode — development mode flag.
         */
        _compileRequire: function (varname, filename, devMode) {
            var relPath = this.node.relativePath(filename);

            // Replaces slashes with backslashes for Windows paths to correct require work.
            /* istanbul ignore if */
            if (relPath.indexOf('\\') !== -1) {
                relPath = relPath.replace(/\\/g, '/');
            }

            return [
                devMode ? 'dropRequireCache(require, require.resolve("' + relPath + '"));' : '',
                (varname ? 'var ' + varname + '= ' : '') + 'require("' + relPath + '")' +
                (varname ? '' : '(blocks)') + ';'
            ].join(EOL);
        },

        /**
         * Compiles code of priv JS module with core and source templates.
         *
         * @protected
         * @param {Array.<{path: String, contents: String}>} privFiles — Files with source templates.
         * @returns {String} compiled code of priv JS module.
         */
        _compile: function (privFiles) {
            var priveFileName = this._coreFileName,
                devMode = this._devMode;

            return [
                devMode ? this._generateDropRequireCacheFunc() : '',
                this._compileRequire('Blocks', priveFileName, devMode),
                'var blocks = new Blocks();',
                '',
                privFiles.map(function (file) {
                    return this._compileRequire(null, file.fullname, devMode);
                }, this).join(EOL),
                '',
                'module.exports = blocks;'
            ].join(EOL);
        }
    })
    .createTech();
