var path = require('path'),
    fs = require('fs'),
    mock = require('mock-fs'),
    MockNode = require('mock-enb/lib/mock-node'),
    Tech = require('../../../techs/priv-bundle'),
    FileList = require('enb/lib/file-list'),
    EOL = require('os').EOL;

describe('priv-bundle', function () {
    var count, privJSCore, fakePrivJSCore, block1, block2, targetPath;

    before(function () {
        privJSCore = fs.readFileSync(require.resolve('priv-js/lib/priv.js'));
        fakePrivJSCore = fs.readFileSync('./test/fixtures/fake.priv.js');
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
        count = 0;
    });

    afterEach(function () {
        mock.restore();
    });

    it('must compile Priv file', function () {
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
        it('must use custom Priv core file', function () {
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

        it('must rebuild if Priv core filename is changed', function () {
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
