var EOL = require('os').EOL,
    fs = require('fs'),
    path = require('path'),
    mock = require('mock-fs'),
    FileList = require('enb/lib/file-list'),
    MockNode = require('mock-enb/lib/mock-node'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache'),
    PrivServerIncludeTech = require('../../techs/priv-server-include'),
    privJSCore = fs.readFileSync(require.resolve('priv-js/lib/priv.js')),
    block1 = fs.readFileSync('./test/fixtures/block1.priv.js'),
    block2 = fs.readFileSync('./test/fixtures/block2.priv.js');

describe('priv-server-include', function () {
    var scheme, targetPath, count = 0;

    beforeEach(function () {
        scheme = {
            blocks: {
                'block1.priv.js': block1,
                'block2.priv.js': block2
            },
            lib: 'module.exports = function () { return "Hello World"; }',
            // jscs:disable
            'node_modules': {
                'priv-js': {
                    lib: {
                        'priv.js': mock.file({
                            content: privJSCore,
                            mtime: new Date(++count)
                        })
                    }
                }
            }
            // jscs:enable
        };
        targetPath = path.resolve('./bundle/bundle.priv.js');
    });

    afterEach(function () {
        mock.restore();
    });

    it('must build common priv-js bundle', function () {
        return build(scheme)
            .spread(function (result) {
                result.exec('block1').must.equal(1);
                result.exec('block2').must.equal(2);
            });
    });

    it('must run code from bundle in isolation of blocks', function () {
        return build(scheme)
            .spread(function () {
                fs.unlinkSync('./blocks/block1.priv.js');
                dropRequireCache(require, targetPath);
                var target = require(targetPath);
                target.exec('block1').must.equal(1);
            });
    });

    it('must use dependencies', function () {
        scheme.blocks['block1.priv.js'] = [
            'module.exports = function (blocks) {',
            '    blocks.declare("block1", function () { return blocks.lib.myLib(); });',
            '};'
        ].join(EOL);

        return build(scheme, {
                dependencies: { myLib: 'function () { return "Hello World"; }' }
            })
            .spread(function (result) {
                return result.exec('block1').must.equal('Hello World');
            });
    });

    it('must keep requires in priv files', function () {
        scheme.blocks['block1.priv.js'] = [
            'var lib = require(\'../lib\');',
            'module.exports = function (blocks) {',
            '    blocks.declare("block1", function () { return lib(); });',
            '};'
        ].join(EOL);

        return build(scheme, {
                keepRequires: true
            })
            .spread(function (result) {
                return result.exec('block1').must.equal('Hello World');
            });
    });
});

function build(scheme, options) {
    scheme.bundle = {};
    mock(scheme);

    var bundle = new MockNode('bundle'),
        fileList = new FileList();

    fileList.loadFromDirSync('blocks');

    bundle.provideTechData('?.files', fileList);
    return bundle.runTechAndRequire(PrivServerIncludeTech, options);
}
