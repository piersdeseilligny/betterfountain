#!/usr/bin/env node

console.info("'afterwriting command line interface");
console.info("www: http://afterwriting.com\n");

global.window = undefined;

require = require('./js/client/awrequire.js');
require.config({
    map: {
        'modernizr': {},
        'pdfkit': 'libs/pdfkit'
    },
    use_node_require: ['jquery', 'fs', 'd3', 'aw-parser', 'protoplast', 'lodash', 'aw-liner']
});

var Bootstrap = require('bootstrap');
var ClientConfig = require('client/client-config');

Bootstrap.init(ClientConfig);