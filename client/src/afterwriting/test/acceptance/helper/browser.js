define(function(require) {

    var p = require('protoplast'),
        SinonFileReader = require('acceptance/util/sinon-file-reader');

    /**
     * Helper for common browser tasks, e.g. time progressing, opening local files, local storage operations.
     */
    var BrowserHelper = p.extend({

        files: null,

        setup: function() {
            SinonFileReader.setup();
            this.clock = sinon.useFakeTimers();
            sinon.stub(window, 'open', function() {return {close: function() {}}});
            
            this.clear_cookies();
            this.clear_local_storage();
            this.clock.tick(5000);

            this.files = {};
        },
        
        has_local_file: function(file) {
            this.files[file.name] = new Blob([file.content], {
                type: file.type || "text/plain;charset=utf-8"
            });
        },
        
        open_local_file: function(name, node) {
            node.files.item = function() {
                return this.files[name]
            }.bind(this);
            this.trigger(node, 'change');
        },

        read_files: function(done) {
            SinonFileReader.wait(done);
        },

        wait: function(callback, ms) {
            sinon.timers.setTimeout.call(window, callback, ms);
        },

        restore: function() {
            this.clear_cookies();
            this.clear_local_storage();
            this.clock.restore();
            window.open.restore();
            SinonFileReader.restore();
            this.files = {};
        },

        clear_cookies: function() {
            document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
        },

        clear_local_storage: function() {
            window.localStorage.clear();
        },

        tick: function(ms) {
            this.clock.tick(ms || 25);
        },

        trigger: function(node, eventType) {
            var event = document.createEvent("Event");
            event.initEvent(eventType, true, true);
            node.dispatchEvent(event);
        },

        // user?
        click: function(node) {
            var event;

            if (!node) {
                throw "NodeDoesNotExist";
            }
            else if (node.click) {
                node.click();
            }
            else if (node instanceof SVGElement) {
                event = document.createEvent("SVGEvents");
                event.initEvent("click",true,true);
                node.dispatchEvent(event);
            }
            else {
                event = document.createEvent("MouseEvent");
                event.initEvent("click",true,true);
                node.dispatchEvent(event);
            }
        }

    });

    return BrowserHelper;

});