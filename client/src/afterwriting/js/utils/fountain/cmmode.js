define(function(require) {
    "use strict";
    
    // TODO: Extract CM mode to a separate library (+++++)
    var CodeMirror = require('libs/codemirror/lib/codemirror');

    CodeMirror.defineMode('fountain', function(config) {

        var mode = {};

        mode.startState = function() {
            return {};
        };

        mode.token = function(stream, state) {
            if (stream.match(/^(?!\!)(\.[^\.]{1}.*|(?:INT|EXT|EST|INT\.?\/EXT\.?|I\/E)(\.| ))(.*)$/, true, true)) {
                return 'scene-header';
            } else if (stream.match(/^=.*$/, true)) {
                return 'synopsis';
            } else if (stream.match(/^#.*$/, true)) {
                return 'section';
            } else if (stream.match(/^  $/, true)) {
                return 'force-blank-line';
            }
            stream.skipToEnd();
        };

        return mode;

    });

    CodeMirror.defineMIME("text/fountain", "fountain");

});