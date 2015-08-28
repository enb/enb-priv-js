var EOL = require('os').EOL,
    fs = require('fs'),
    path = require('path'),
    mock = require('mock-fs'),
    FileList = require('enb/lib/file-list'),
    MockNode = require('mock-enb/lib/mock-node'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache'),
    Tech = require('../../../techs/priv-bundle'),
    count;

describe('priv-bundle --node', function () {
    var targetPath,
        privJSCore,
        block1,
        block2;

    before(function () {
        count = 0;
        privJSCore = fs.readFileSync(require.resolve('priv-js/lib/priv.js'));
        block1 = [
            'module.exports = function (blocks) {',
            '    blocks.declare("block1", function () { return 1; });',
            '};'
        ].join(EOL);
        block2 = [
            'module.exports = function (blocks) {',
            '    blocks.declare("block2", function () { return 2; });',
            '};'
        ].join(EOL);
        targetPath = path.resolve('./bundle/bundle.priv.js');
    });

    afterEach(function () {
        mock.restore();
    });

    it('must build common priv-js bundle', function () {
        return build({
                blocks: {
                    'block1.priv.js': block1,
                    'block2.priv.js': block2
                }
            })
            .then(function (result) {
                result.exec('block1').must.equal(1);
                result.exec('block2').must.equal(2);
            });
    });

    it('must run code from bundle in isolation of blocks', function () {
        return build({
                blocks: {
                    'block1.priv.js': block1
                }
            })
            .then(function () {
                fs.unlinkSync('./blocks/block1.priv.js');
                dropRequireCache(require, targetPath);
                var target = require(targetPath);
                target.exec('block1').must.equal(1);
            });
    });

    describe('requires', function () {
        it('must get dependency from global scope using simple key', function () {
            var scheme = {
                    blocks: {
                        'block1.priv.js': [
                            'module.exports = function (blocks) {',
                            '    blocks.declare("block1", function () { return blocks.lib.text; });',
                            '};'
                        ].join(EOL)
                    }
                },
                options = {
                    requires: {
                        text: {
                            globals: 'text'
                        }
                    }
                },
                lib = 'this.text = "Hello World";';

            return build(scheme, options, lib)
                .then(function (result) {
                    return result.exec('block1').must.equal('Hello World');
                });
        });

        it('must get dependency from global scope using dot-delimited key', function () {
            var scheme = {
                    blocks: {
                        'block1.priv.js': [
                            'module.exports = function (blocks) {',
                            '    blocks.declare("block1", function () { return blocks.lib.text; });',
                            '};'
                        ].join(EOL)
                    }
                },
                options = {
                    requires: {
                        text: {
                            globals: 'text.value'
                        }
                    }
                },
                lib = 'this.text = { value: "Hello World" };';

            return build(scheme, options, lib)
                .then(function (result) {
                    return result.exec('block1').must.equal('Hello World');
                });
        });

        it('must require module from CommonJS', function () {
            var scheme = {
                    blocks: {
                        'block1.priv.js': [
                            'var fake = blocks.lib.fake;',
                            'module.exports = function (blocks) {',
                            '    blocks.declare("block1", function () { return fake.getText(); });',
                            '};'
                        ].join(EOL)
                    }
                },
                options = {
                    requires: {
                        fake: {
                            commonJS: 'fake'
                        }
                    }
                };

            return build(scheme, options)
                .then(function (result) {
                    return result.exec('block1').must.equal('Hello World');
                });
        });
    });

    function build(scheme, options, lib) {
        scheme.bundle = {};
        // jscs:disable
        scheme['node_modules'] = {
            'priv-js': {
                lib: {
                    'priv.js': mock.file({
                        content: privJSCore,
                        mtime: new Date(++count)
                    })
                }
            },
            fake: {
                'index.js': 'module.exports = { getText: function () { return "Hello World"; } };'
            }
        };
        // jscs:enable

        mock(scheme);

        var bundle = new MockNode('bundle'),
            fileList = new FileList();

        fileList.loadFromDirSync('blocks');

        bundle.provideTechData('?.files', fileList);
        return bundle.runTech(Tech, options)
            .spread(function () {
                var contents = [
                        lib || '',
                        fs.readFileSync(targetPath, 'utf-8')
                    ].join(EOL);

                fs.writeFileSync(targetPath, contents);

                dropRequireCache(require, targetPath);
                return require(targetPath);
            });
    }
});
