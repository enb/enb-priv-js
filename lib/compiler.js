var vow = require('vow'),
    vfs = require('enb/lib/fs/async-fs'),
    browserify = require('browserify'),
    promisify = require('vow-node').promisify,
    EOL = require('os').EOL;

/**
 * Wraps code of Priv to bundle.
 *
 * The compiled bundle supports CommonJS and YModules. If there is no any modular system in the runtime,
 * the module will be provided as global variable with `blocks`.
 *
 * @param {Array.<{path: String, contents: String}>} sources Files with source templates.
 * @param {Object}   options                         Options.
 * @param {String}   options.dirname                 Path to a directory with compiled file.
 * @param {Object}   [options.requires={}]           Names for dependencies.
 * @returns {String}
 */
exports.compile = function (sources, options) {
    options || (options = {});

    var exportName = 'blocks',
        requires = options.requires || {},
        libs = {
            commonJS: Object.keys(requires).reduce(function (prev, name) {
                var item = requires[name];
                if (item.commonJS) {
                    prev.push(name + ': require("' + item.commonJS + '")');
                } else if (item.globals) {
                    prev.push(name + ': global' + compileGlobalAccessor(item.globals));
                }
                return prev;
            }, []),
            yModules: Object.keys(requires).reduce(function (prev, name) {
                var item = requires[name];
                if (item.ym) {
                    prev.push(name + ': ' + item.ym);
                } else if (item.commonJS) {
                    prev.push(name + ': require("' + item.commonJS + '")');
                } else if (item.globals) {
                    prev.push(name + ': global' + compileGlobalAccessor(item.globals));
                }
                return prev;
            }, []),
            global: Object.keys(requires).reduce(function (prev, name) {
                var item = requires[name];
                if (item.globals) {
                    prev.push(name + ': global' + compileGlobalAccessor(item.globals));
                } else if (item.commonJS) {
                    prev.push(name + ': require("' + item.commonJS + '")');
                }
                return prev;
            }, [])
        };

    libs = Object.keys(libs).reduce(function (prev, item) {
        prev[item] = '{' + libs[item].join(',' + EOL) + '}';
        return prev;
    }, {});

    return vow
        .all([
            getPrivCoreSource(options.coreFileName),
            compileCommonJSRequire(requires, options.dirname)
        ])
        .spread(function (core, commonJSRequire) {
            return [
                // IIFE start
                '(function(global) {',
                // dirty hack on priv core code
                core.contents.replace('module.exports = Blocks;', ''),
                'var blocks = new Blocks()',
                'var init = function(global, Blocks){',
                sources.map(function (source) {
                    var relPath = source.relPath || source.path;
                    return [
                        '// begin: ' + relPath,
                        source.contents,
                        '// end: ' + relPath
                    ].join(EOL);
                }).join(EOL),
                '};',
                commonJSRequire,
                // Export template start
                'var defineAsGlobal = true;',
                // Provide with CommonJS
                'if(typeof module === "object" && typeof module.exports === "object") {',
                '    init();',
                '    module.exports = blocks;',
                '    defineAsGlobal = false;',
                '}',
                // Provide to YModules
                'if(typeof modules === "object") {',
                compileYModule(exportName, requires),
                '    defineAsGlobal = false;',
                '}',
                // Provide to global scope
                'if(defineAsGlobal) {',
                Object.keys(requires).map(function (name) {
                    var item = requires[name];
                    if (item.globals) {
                        return '    blocks.lib.' + name + ' = global' + compileGlobalAccessor(item.globals) + ';';
                    }
                }).join(EOL),
                '    init();',
                '    global["' + exportName + '"] = blocks;',
                '}',
                // IIFE finish
                '})(this);'
            ].join(EOL);
        });
};

/**
 * Reads code of Priv core.
 *
 * @ignore
 * @param {String} filename — path to file with Priv core.
 * @returns {{ path: String, contents: String }}
 */
function getPrivCoreSource(filename) {
    return vfs.read(filename, 'utf-8')
        .then(function (contents) {
            return {
                path: filename,
                contents: contents
            };
        });
}

/**
 * Compiles code with YModule definition that exports Priv module.
 *
 * @ignore
 * @param {String}   name        Module name.
 * @param {Object}   [requires]  Names for requires to `blocks.lib.name`.
 * @returns {String}
 */
function compileYModule(name, requires) {
    var modules = [],
        deps = [],
        globals = {};

    requires && Object.keys(requires).forEach(function (name) {
        var item = requires[name];

        if (item.ym) {
            modules.push(item.ym);
            deps.push(name);
        } else if (item.globals) {
            globals[name] = item.globals;
        }
    });

    return [
        '  modules.define("' + name + '"' + (modules ? ', ' + JSON.stringify(modules) : '') +
        ', function(provide' + (deps && deps.length ? ', ' + deps.join(', ') : '') + ') {',
        deps.map(function (name) {
            return '        blocks.lib.' + name + ' = ' + name + ';';
        }).join(EOL),
        Object.keys(globals).map(function (name) {
            return '        blocks.lib.' + name + ' = global' + compileGlobalAccessor(globals[name]) + ';';
        }).join(EOL),
        '        provide(blocks);',
        '    });'
    ].join(EOL);
}

/**
 * Compiles require with modules from CommonJS.
 *
 * @ignore
 * @param {Object}   [requires] Names for requires to `blocks.lib.name`.
 * @param {String}   [dirname]  Path to a directory with compiled file.
 * @returns {String}
 */

function compileCommonJSRequire(requires, dirname) {
    var browserifyOptions = {
            basedir: dirname
        },
        renderer = browserify(browserifyOptions),
        bundle = promisify(renderer.bundle.bind(renderer)),
        provides = [],
        hasCommonJSRequires = false;

    Object.keys(requires).map(function (name) {
        var item = requires[name];

        if (item.commonJS) {
            renderer.require(item.commonJS);
            provides.push('blocks.lib.' + name + ' = require("' + item.commonJS + '");');
            hasCommonJSRequires = true;
        } else if (item.globals) {
            provides.push('blocks.lib.' + name + ' = global' + compileGlobalAccessor(item.globals) + ';');
        }
    });

    if (!hasCommonJSRequires) {
        return vow.resolve(provides.join(EOL));
    }

    return bundle()
        .then(function (buf) {
            return [
                '(function () {',
                'var ' + buf.toString(),
                provides.join(EOL),
                '}());'
            ].join(EOL);
        });
}

/**
 * Compiles accessor path of the `global` object.
 *
 * @ignore
 * @param {String} value  Dot delimited accessor path
 * @returns {String}
 */
function compileGlobalAccessor(value) {
    return '["' + value.split('.').join('"]["') + '"]';
}
