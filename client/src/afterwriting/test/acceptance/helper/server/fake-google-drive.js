define(function(require) {

    var FakeServer = require('acceptance/helper/server/fake-server'),
        FakeGapi = require('acceptance/helper/server/fake-gapi'),
        gd = require('utils/googledrive');

    /**
     * Mock the GoogleDrive API
     */
    var DropboxApi = FakeServer.extend({

        name: 'googledrive',

        gdInit: null,

        gapi: undefined,

        enabled: true,

        files: null,

        contents: null,

        $create: function() {
            this.files = {};
            this.contents = {};
        },

        enable: function() {
            this.enabled = true;
            window.gapi = this.gapi;
        },

        disable: function() {
            this.enabled = false;
            delete window.gapi;
        },

        setup: function() {
            this.gdInit = gd.init;

            gd.init = function() {
                this.gapi = FakeGapi.create();
                if (this.enabled) {
                    window.gapi = this.gapi;
                }
            }.bind(this);
        },

        auth_google_drive: function() {
            window.gapi.auth.commitInit();
        },

        has_file: function(file) {
            var id = '/' + file.name;
            this.contents[id] = file.content;

            this.files[id] = {
                alternateLink: '#',
                downloadUrl: 'https://fake-google-drive/' + id,
                editable: true,
                id: id,
                kind: 'drive#file',
                parents: [],
                explicitlyTrashed: false,
                trashed: false,
                userPermission: {
                    role: 'owner'
                },
                name: file.name,
                spaces: ['drive']
            };
        },

        restore: function() {
            gd.init = this.gdInit.bind(gd);
        },

        file_details: {
            url: /drive\/v2\/files\/(.+)/,
            method: 'GET',
            value: function(xhr, id) {
                return JSON.stringify(this.files[id]);
            }
        },

        file_content: {
            url: /https:\/\/fake-google-drive\/(.*)/,
            method: 'GET',
            content_type: 'plain/text',
            value: function(xhr, id) {
                return this.contents[id];
            }
        },

        file_list: {
            url: /drive\/v3\/files\/$/,
            method: 'GET',
            value: function() {
                var files = [];
                for (var file in this.files) {
                    if (this.files.hasOwnProperty(file)) {
                        files.push(this.files[file]);
                    }
                }
                return JSON.stringify({
                    files: files
                });
            }
        }
    });

    return DropboxApi;

});