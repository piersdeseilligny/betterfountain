var Protoplast = require('protoplast');
var stdio = require('stdio');

var Options = Protoplast.extend({

    ops: null,

    $create: function() {
        this.ops = stdio.getopt({
            'source': {
                key: 'source',
                args: 1,
                description: 'Fountain screenplay to load',
                mandatory: true
            },
            'pdf': {
                key: 'pdf',
                args: '*',
                description: 'output PDF filename'
            },
            'config': {
                key: 'config',
                args: 1,
                description: 'configuration file'
            },
            'overwrite': {
                key: 'overwrite',
                args: 0,
                description: 'overwrite exiting files'
            },
            'fonts': {
                key: 'fonts',
                args: 1,
                description: 'custom font json file'
            }
        });
        this._validateOptions();
    },
    
    _validateOptions: function() {
        if (this.ops.pdf === true) {
            i = this.ops.source.lastIndexOf('.');
            this.ops.pdf = this.ops.source.slice(0, i) + '.pdf';
        }

        if (this.ops.pdf === this.ops.source) {
            this.ops.pdf += '.pdf';
        }
    }

});

module.exports = Options;
