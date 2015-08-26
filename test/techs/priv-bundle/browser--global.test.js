var EOL = require('os').EOL,
    fs = require('fs'),
    path = require('path'),
    mock = require('mock-fs'),
    MockNode = require('mock-enb/lib/mock-node'),
    FileList = require('enb/lib/file-list'),
    Tech = require('../../../techs/priv-bundle'),
    htmlFilename = path.join(__dirname, '..', '..', 'fixtures', 'index.html'),
    mochaFilename = require.resolve('mocha/mocha.js'),
    chaiFilename = require.resolve('chai/chai.js'),
    runServer = require('../../lib/run-server'),
    privJSCore = fs.readFileSync(require.resolve('priv-js/lib/priv.js')),
    block1 = fs.readFileSync('./test/fixtures/block1.priv.js'),
    block2 = fs.readFileSync('./test/fixtures/block2.priv.js');

describe('priv-bundle browser --global', function () {
    afterEach(function () {
        mock.restore();
    });

    it('compiled files should works on client-side', function () {
        var test = [
            'chai.should();',
            'it("autogenerated test", function () {',
            '    blocks.exec(\'block1\').should.equal(1);',
            '    blocks.exec(\'block2\').should.equal(2);',
            '})'
        ].join(EOL);

        return runTest(test);
    });

    describe('requires', function () {
        it('must get dependency from global scope using simple key', function () {
            var test = [
                    'chai.should();',
                    'it("autogenerated test", function () {',
                    '    blocks.exec(\'block1\').should.equal("Hello World");',
                    '})'
                ].join(EOL),
                options = {
                    requires: {
                        depend: {
                            globals: 'depend'
                        }
                    }
                },
                template = [
                    'module.exports = function (blocks) {',
                    '    blocks.declare("block1", function () { return blocks.lib.depend; });',
                    '};'
                ].join(EOL),
                lib = 'var depend = "Hello World";';

            return runTest(test, options, template, lib);
        });

        it('must get dependency from global scope using dot-delimited key', function () {
            var test = [
                    'chai.should();',
                    'it("autogenerated test", function () {',
                    '    blocks.exec(\'block1\').should.equal("Hello World");',
                    '})'
                ].join(EOL),
                options = {
                    requires: {
                        depend: {
                            globals: 'depend.key'
                        }
                    }
                },
                template = [
                    'module.exports = function (blocks) {',
                    '    blocks.declare("block1", function () { return blocks.lib.depend; });',
                    '};'
                ].join(EOL),
                lib = 'var depend = { key: "Hello World" };';

            return runTest(test, options, template, lib);
        });

        it('must get dependency from CommonJS', function () {
            var test = [
                    'chai.should();',
                    'it("autogenerated test", function () {',
                    '    blocks.exec(\'block1\').should.equal("Hello World");',
                    '})'
                ].join(EOL),
                options = {
                    requires: {
                        fake: {
                            commonJS: 'fake'
                        }
                    }
                },
                template = [
                    'var fake = blocks.lib.fake;',
                    'module.exports = function (blocks) {',
                    '    blocks.declare("block1", function () { return fake.getText(); });',
                    '};'
                ].join(EOL);

            return runTest(test, options, template);
        });

        it('must get dependency from global scope if it is still in CommonJS', function () {
            var test = [
                    'chai.should();',
                    'it("autogenerated test", function () {',
                    '    blocks.exec(\'block1\').should.equal("globals");',
                    '})'
                ].join(EOL),
                options = {
                    requires: {
                        depend: {
                            globals: 'depend',
                            commonJS: 'depend'
                        }
                    }
                },
                template = [
                    'module.exports = function (blocks) {',
                    '    blocks.declare("block1", function () { return blocks.lib.depend; });',
                    '};'
                ].join(EOL),
                lib = 'var depend = "globals";';

            return runTest(test, options, template, lib);
        });
    });
});

function runTest(testContent, options, template, lib) {
    var bundle,
        fileList,

        scheme = {
            blocks: {
                'block1.priv.js': template || block1,
                'block2.priv.js': block2
            },
            bundle: {},
            // jscs:disable
            node_modules: {
                'priv-js': {
                    lib: {
                        'priv.js': privJSCore
                    }
                },
                fake: {
                    'index.js': 'module.exports = { getText: function () { return "Hello World"; } };'
                },
                depend: {
                    'index.js': 'module.exports = "CommonJS";'
                }
            },
            // jscs:enable
            'index.html': fs.readFileSync(htmlFilename, 'utf-8'),
            'test.js': testContent,
            'mocha.js': fs.readFileSync(mochaFilename, 'utf-8'),
            'chai.js': fs.readFileSync(chaiFilename, 'utf-8'),
            'some-lib.js': lib || ''
        };

    mock(scheme);

    bundle = new MockNode('bundle');
    fileList = new FileList();
    fileList.loadFromDirSync('blocks');
    bundle.provideTechData('?.files', fileList);

    return bundle.runTech(Tech, options)
        .then(function () {
            return runServer(3000);
        });
}
