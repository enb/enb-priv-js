var EOL = require('os').EOL,
    fs = require('fs'),
    path = require('path'),
    mock = require('mock-fs'),
    FileList = require('enb/lib/file-list'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache'),
    MockNode = require('mock-enb/lib/mock-node'),
    Tech = require('../../techs/priv-commonjs');

describe('priv-commonjs', function () {
    var count, privJSCore, fakePrivJSCore, block1, block2, targetPath;

    before(function () {
        privJSCore = fs.readFileSync(require.resolve('priv-js/lib/priv.js'));
        fakePrivJSCore = fs.readFileSync('./test/fixtures/fake.priv.js');
        block1 = fs.readFileSync('./test/fixtures/block1.priv.js');
        block2 = fs.readFileSync('./test/fixtures/block2.priv.js');
        targetPath = path.resolve('./bundle/bundle.priv.js');
        count = 0;
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
            .spread(function (target) {
                target.exec('block1').must.equal(1);
                target.exec('block2').must.equal(2);
            });
    });

    describe('custom Priv', function () {
        it('must use custom Priv core', function () {
            return build({
                    'fake.priv.js': fakePrivJSCore,
                    blocks: {
                        'block1.priv.js': block1
                    }
                },
                { coreFileName: path.resolve('./fake.priv.js') })
                .spread(function (target) {
                    target.exec('block1').must.equal('block1');
                });
        });

        it('must rebuild if Priv filename is changed', function () {
            var bundle = prepare({
                    'fake.priv.js': fakePrivJSCore,
                    blocks: {
                        'block1.priv.js': block1
                    }
                }),
                options = {
                    coreFileName: path.resolve('./fake.priv.js')
                };
            return bundle.runTech(Tech)
                .then(function () {
                    return bundle.runTechAndRequire(Tech, options);
                })
                .spread(function (target) {
                    target.exec('block1').must.equal('block1');
                });
        });
    });

    describe('CommonJS', function () {
        it('truly CommonJS', function () {
            var scheme = {
                blocks: {
                    'block1.priv.js': [
                        'var url = require("url")',
                        'module.exports = function (blocks) {',
                        '    blocks.declare("block1", function () { ',
                        '        return url.resolve("http://example.com/", "/pathname");',
                        '    });',
                        '};'
                    ].join(EOL)
                }
            };
            return build(scheme)
                .spread(function (target) {
                    target.exec('block1').must.equal('http://example.com/pathname');
                });
        });

        it('must correctly resolve path', function () {
            var scheme = {
                blocks: {
                    'some-module.js': 'module.exports = function () { return "Hello World"; }',
                    'block1.priv.js': [
                        'module.exports = function (blocks) {',
                        '    blocks.declare("block1", function () { ',
                        '        var sm = require("./some-module")',
                        '        return sm();',
                        '    });',
                        '};'
                    ].join(EOL)
                }
            };
            return build(scheme)
                .spread(function (target) {
                    target.exec('block1').must.equal('Hello World');
                });
        });
    });

    describe('mode', function () {
        beforeEach(function () {
            dropRequireCache(require, path.resolve('blocks', 'block1.priv.js'));
            dropRequireCache(require, path.resolve('blocks', 'block2.priv.js'));
        });

        it ('must drop require cache in dev mode', function () {
            return build({
                    blocks: {
                        'block1.priv.js': block1
                    }
                }, { devMode: true })
                .spread(function (target) {
                    target.exec('block1').must.equal(1);
                    fs.writeFileSync('./blocks/block1.priv.js', [
                        'module.exports = function (blocks) {',
                        '    blocks.declare("block1", function () { return 0; });',
                        '};'
                    ].join(EOL));
                    dropRequireCache(require, targetPath);
                    target = require(targetPath);
                    target.exec('block1').must.equal(0);
                });
        });

        it ('must not drop require cache in prod mode', function () {
            return build({
                    blocks: {
                        'block1.priv.js': block1
                    }
                }, { devMode: false })
                .spread(function (target) {
                    target.exec('block1').must.equal(1);
                    fs.writeFileSync('./blocks/block1.priv.js', [
                        'module.exports = function (blocks) {',
                        '    blocks.declare("block1", function () { return 0; });',
                        '};'
                    ].join(EOL));
                    dropRequireCache(require, targetPath);
                    target = require(targetPath);
                    target.exec('block1').must.equal(1);
                });
        });
    });

    function prepare(scheme) {
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
            }
        };
        // jscs:enable

        mock(scheme);

        var bundle = new MockNode('bundle'),
            fileList = new FileList();

        fileList.loadFromDirSync('blocks');

        bundle.provideTechData('?.files', fileList);
        return bundle;
    }

    function build(scheme, options) {
        return prepare(scheme).runTechAndRequire(Tech, options);
    }
});
