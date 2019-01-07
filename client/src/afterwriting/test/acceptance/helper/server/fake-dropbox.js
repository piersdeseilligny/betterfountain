define(function(require) {

    var FakeServer = require('acceptance/helper/server/fake-server'),
        db = require('utils/dropbox');

    /**
     * Mock the Dropbox API
     */
    var DropboxApi = FakeServer.extend({

        name: 'dropbox',
        
        files: null,

        contents: null,

        saved_count: null,

        enabled: true,

        $create: function() {
            this.saved_count = 0;
        },
        
        enable: function() {
            db.initialised = true;
            this.enabled = true;
        },
        
        disable: function() {
            db.initialised = false;
            this.enabled = false;
        },

        setup: function(proxy) {
            this.DropboxRequest = Dropbox.Util.Xhr.Request;
            sinon.stub(Dropbox.Util.Oauth, 'randomAuthStateParam', function() {
                return 'oauth_state';
            });
            Dropbox.Util.Xhr.Request = proxy.xhr;
            this.files = [];
            this.contents = {};
        },

        restore: function() {
            this.files = [];
            this.contents = {};
            Dropbox.Util.Xhr.Request = this.DropboxRequest;
            Dropbox.Util.Oauth.randomAuthStateParam.restore();
        },
        
        has_file: function(file) {
            this.contents[file.name] = file.content;
            this.files.push([
                '/' + file.name,
                {
                    bytes: file.content.length,
                    client_mtime: 'Wed, 21 Nov 2012 18:26:43 +0000',
                    icon: 'page_white_text',
                    is_dir: false,
                    mime_type: file.mime_type || 'text/plain',
                    modified: 'Wed, 21 Nov 2012 18:26:43 +0000',
                    modifier: null,
                    path: '/' + file.name,
                    read_only: false,
                    rev: '1',
                    revision: 1,
                    root: 'dropbox',
                    size: '1 KB',
                    thumb_exists: false
                }
            ]);
        },

        delta: {
            url: /https:\/\/api\d*.dropbox.com\/1\/delta/,
            method: 'POST',
            value: function() {
                return JSON.stringify({
                    has_more: false,
                    reset: false,
                    cursor: 'cursor',
                    entries: this.files
                });
            }
        },

        file_content: {
            url: /https:\/\/api-content.dropbox.com\/1\/files\/auto\/([0-9a-z.]+)/,
            method: 'GET',
            value: function(xhr, filename) {
                return this.contents[filename];
            }
        },

        save_content: {
            url: /https:\/\/api-content.dropbox.com\/1\/files\/auto\//,
            method: 'POST',
            value: function() {
                if (!this.enabled) {
                    throw new Error();
                }
                this.saved_count++;
                return JSON.stringify({
                    bytes: 10,
                    client_mtime: 'Wed, 21 Nov 2012 18:26:43 +0000',
                    icon: 'page_white_text',
                    is_dir: false,
                    mime_type: 'text/plain',
                    modified: 'Wed, 21 Nov 2012 18:26:43 +0000',
                    modifier: null,
                    path: '/file.fountain',
                    read_only: false,
                    rev: '1',
                    revision: 1,
                    root: 'dropbox',
                    size: '1 KB',
                    thumb_exists: false
                });
            }
        },

        auth_dropbox: function() {
            var event = document.createEvent('CustomEvent');
            event.initEvent('message');
            event.origin = 'http://localhost:8000';
            event.data = 'access_token=DROPBOX_TOKEN&uid=1&state=oauth_state';
            window.dispatchEvent(event);
        },

        content_change: function(filename, content) {
            if (this.contents[filename]) {
                this.contents[filename] = content;
            }
            else {
                throw new Error('File ' + filename + ' does not exist');
            }
        }

    });

    return DropboxApi;

});