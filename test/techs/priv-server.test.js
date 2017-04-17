var EOL = require('os').EOL,
    fs = require('fs'),
    path = require('path'),
    mock = require('mock-fs'),
    FileList = require('enb/lib/file-list'),
    dropRequireCache = require('enb/lib/fs/drop-require-cache'),
    MockNode = require('mock-enb/lib/mock-node'),
    PrivServerTech = require('../../techs/priv-server'),
    privJSCore = fs.readFileSync(require.resolve('priv-js/lib/priv.js')),
    block1 = fs.readFileSync('./test/fixtures/block1.priv.js'),
    block2 = fs.readFileSync('./test/fixtures/block2.priv.js');

describe('priv-server', function () {
    var scheme, targetPath;

    beforeEach(function () {
        scheme = {
            blocks: {
                'block1.priv.js': block1,
                'block2.priv.js': block2
            },
            // jscs:disable
            'node_modules': {
                'priv-js': {
                    lib: {
                        'priv.js': privJSCore
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
            .then(function () {
                var target = require(targetPath);
                target.exec('block1').must.equal(1);
                target.exec('block2').must.equal(2);
            });
    });

    it ('must drop require cache', function () {
        return build(scheme)
            .then(function () {
                require(targetPath);
                fs.writeFileSync('./blocks/block1.priv.js', [
                    'module.exports = function (blocks) {',
                    '    blocks.declare("block1", function () { return 0; });',
                    '};'
                ].join(EOL));
                dropRequireCache(require, targetPath);
                var target = require(targetPath);
                target.exec('block1').must.equal(0);
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
    return bundle.runTech(PrivServerTech, options);
}
