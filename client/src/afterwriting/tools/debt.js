/**
 * Script calculates and print current technical debt (see docs/adr-002-technical-debt)
 */

var fs = require('fs');
var finder = require('findit')(process.argv[2] || '.');
var path = require('path');

var config = {
    excludeBase: ['.git', 'node_modules', 'coverage', 'docs', 'bundle', 'samples'],
    excludeFolders: ['js\\libs'],
    excludeFiles: ['js\\utils\\courier-prime-font.js']
};

var data = {
    files: null,
    debt: null
};

function getFiles(config, data, callback) {
    data.files = [];

    finder.on('directory', function (dir, stat, stop) {
        var base = path.basename(dir);
        if (config.excludeBase.indexOf(base) !== -1 || config.excludeFolders.indexOf(dir) !== -1) {
            stop();
        }
    });

    finder.on('file', function (file) {
        if (path.extname(file) === '.js' && config.excludeFiles.indexOf(file) === -1) {
            data.files.push(file);
        }
    });

    finder.on('end', callback);
}

function calcDebt(data) {
    data.debt = [];
    data.totalDebt = 0;

    data.files.forEach(function(filename) {
        var content = fs.readFileSync(filename, {encoding: 'utf-8'});
        var lines = content.split(/\r|\n|\n\r/);
        var debtSearch;
        lines.forEach(function(line, lineNumber) {
            if (debtSearch = line.match(/.*TODO:.*(\(\++\))/)) {
                var debtValue = debtSearch[1].length - 2;
                data.debt.push({
                    file: filename,
                    lineNumber: lineNumber,
                    line: line,
                    debtString: debtSearch[1],
                    debt: debtValue
                });
                data.totalDebt += debtValue;
            }
        });
    });
    data.debt.sort(function(a, b) {
        return b.debt - a.debt;
    });
}

function printDebt(data) {
    var debt = data.debt;

    debt.forEach(function(debtDetails) {
        console.log(debtDetails.file + ':' + debtDetails.lineNumber + ' ' + debtDetails.debtString);
    });

    console.log('Total debt: ' +  data.totalDebt);
}

getFiles(config, data, function() {
    calcDebt(data);
    printDebt(data);
});