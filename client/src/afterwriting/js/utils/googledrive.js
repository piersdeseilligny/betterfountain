define(function(require) {

    var client_id = '540351787353-3jf0j12ccl0tmv2nbkcdncu0tuegjkos.apps.googleusercontent.com',
        scope = ['https://www.googleapis.com/auth/drive'],
        $ = require('jquery'),
        fn = require('utils/fn'),
        module = {};

    module.init = function() {
        if (window.location.protocol !== 'file:') {
            var tag = document.createElement('script'),
                script_tag = document.getElementsByTagName('script')[0];
            tag.async = 1;
            tag.src = 'https://apis.google.com/js/client.js';
            tag.onload = function() {
                gapi.load('auth');
            };
            script_tag.parentNode.insertBefore(tag, script_tag);
        }
    };

    module.is_available = function() {
        return !!window.gapi && window.location.protocol !== 'file:';
    };

    /**
     * Authorize and run the callback after authorization
     */
    module.auth = function(callback) {
        gapi.auth.init(function() {
            authorize(true, handle_auth.bind(null, callback));
        });
    };

    /**
     * Decorates method with auth call
     */
    var auth_method = function(method) {
        return function() {
            var method_args = arguments;
            module.auth(function() {
                method.apply(null, method_args);
            });
        };
    };

    /**
     * Authorize to gapi
     */
    var authorize = function(immediate, callback) {
        gapi.auth.authorize({
            client_id: client_id,
            scope: scope,
            immediate: immediate,
        }, callback);
    };

    /**
     * Handle authorization. If authorization fails - tries to auth with immediate=false
     */
    var handle_auth = function(callback, result) {
        if (result && !result.error) {
            module.access_token = result.access_token;
            callback();
        } else {
            authorize(false, handle_auth_fallback.bind(null, callback));
        }
    };

    var handle_auth_fallback = function(callback, result) {
        if (result && !result.error) {
            module.access_token = result.access_token;
            callback();
        } else {
            $.prompt('Google Drive authorization failed.');
        }

    };

    /**
     * Poll file content
     */
    module.sync = function(fileid, timeout, sync_callback) {
        module.sync_timeout = setInterval(function() {
            module.load_file(fileid, function(content) {
                sync_callback(content);
            });
        }, timeout);
    };

    /**
     * Clears synchornization
     */
    module.unsync = function() {
        clearInterval(module.sync_timeout);
    };

    /**
     * Download content of the file by id
     */
    var load_file = function(id, content_callback) {
        gapi.client.request({
            path: '/drive/v2/files/' + id,
            method: 'GET'
        }).execute(function(response) {
            if (!response.error) {
                var url = response.exportLinks && response.exportLinks['text/plain'] ? response.exportLinks['text/plain'] : response.downloadUrl;
                download(url, function(content) {
                    if (response.mimeType === "application/vnd.google-apps.document") {
                        content = content.replace(/\r\n\r\n/g, '\r\n');
                    }
                    content_callback(content, response.alternateLink, response.id);
                });
            } else {
                $.prompt('Could not open the file!');
                content_callback(undefined);
            }
        });
    };
    module.load_file = auth_method(load_file);

    /**
     * Fetch a file from a URL
     */
    var download = function(url, callback) {
        $.ajax({
            url: url,
            type: 'GET',
            beforeSend: function(xhr) {
                return xhr.setRequestHeader('Authorization', 'Bearer ' + module.access_token);
            },
            success: callback
        });
    };

    /**
     * Upload a file
     */
    var upload = function(options) {
        var blob = options.blob,
            filename = options.filename || 'newfile',
            callback = options.callback,
            parents = options.parents,
            fileid = options.fileid,
            convert = options.convert,
            isUpdate = fileid !== null;

        if (convert) {
            filename = filename.replace(/\.gdoc$/, '');
        }

        var boundary = '-------314159265358979323846';
        var delimiter = "\r\n--" + boundary + "\r\n";
        var close_delim = "\r\n--" + boundary + "--";
        var reader = new FileReader();
        reader.readAsBinaryString(blob);
        reader.onload = function() {
            var contentType = blob.type || 'application/octet-stream';
            var metadata = {
                'mimeType': contentType
            };

            if (!isUpdate) {
                metadata.title = filename;
                metadata.parents = parents || [];
            }

            var base64Data = btoa(reader.result);
            var multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

            var path = '/upload/drive/v2/files/';
            if (isUpdate) {
                path += fileid;
            }

            gapi.client.request({
                'path': path,
                'method': isUpdate ? 'PUT' : 'POST',
                'params': {
                    'uploadType': 'multipart',
                    'convert': convert
                },
                'headers': {
                    'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                },
                'body': multipartRequestBody
            }).then(
                function(response) {
                    callback(response.result);
                },
                function(response) {
                    $.prompt.close();
                    $.prompt(response.result.error.message);
                });

        };
    };
    module.upload = auth_method(upload);

    /**
     * Generate list of files/folders
     */
    var list = function(callback, options) {
        options = options || {};

        options.error = options.error || function() {};

        if (options.lazy) {
            callback(function(node, callback) {
                lazy_list(options, node, callback);
            });
            return;
        }

        if (options.before) {
            options.before();
        }
        
        var conflate_caller = function(conflate_callback, data) {
            var request_data = {
                path: '/drive/v3/files/',
                method: 'GET',
                params: {
                    corpus: "user",
                    fields: "nextPageToken,files/id,files/mimeType,files/name,files/trashed,files/explicitlyTrashed,files/parents,files/shared",
                    q: 'trashed=false' + (options.folder ? " and  '" + options.folder + "' in parents" : '')
                }
            };
    
            if (data && data.nextPageToken) {
                request_data.params.pageToken = data.nextPageToken;
            }
            
            gapi.client.request(request_data).then(
                function(response) {
                    conflate_callback(response.result);
                },
                function(response) {
                    $.prompt.close();
                    $.prompt(response.result.error.message);
                });
        };

        var conflate_tester = function(data) {
            return data.nextPageToken;
        };

        var conflate_final = function(results) {
            var items = [];
            results.forEach(function(args) {
                items = items.concat(args[0].files);
            });
            pull_callback(items);
        };

        var pull_callback = function(items) {
            items = items.filter(function(item) {
                return !item.explicitlyTrashed && !item.trashed;
            });
            var map_items = {},
                root = {
                    title: 'My Drive',
                    id: 'root',
                    isRoot: true,
                    isFolder: true,
                    children: []
                };

            items = items.filter(function(i) {
                return !options.pdfOnly || i.mimeType === "application/pdf" || i.mimeType === "application/vnd.google-apps.folder";
            });

            items.forEach(function(f) {
                map_items[f.id] = f;
                f.title = f.name;
                f.isFolder = f.mimeType === "application/vnd.google-apps.folder";
                f.disabled = options.writeOnly && f.userPermission && f.userPermission.role && ["owner", "writer"].indexOf(f.userPermission.role) === -1;
                f.children = [];
            });
            items.sort(function(a, b) {
                if (a.isFolder && !b.isFolder) {
                    return -1;
                }
                else if (!a.isFolder && b.isFolder) {
                    return 1;
                }
                return a.title > b.title ? 1 : -1;
            });
            items.forEach(function(i) {
                if (!i.parents || i.parents.length === 0) {
                    root.children.push(i);
                }
                else {
                    i.parents.forEach(function(p) {
                        var parent = map_items[p] || root;
                        parent.children.push(i);
                    });
                }
            });
            if (options.after) {
                options.after();
            }
            callback(root);
        };

        fn.conflate(conflate_caller, conflate_tester, conflate_final);
    };
    module.list = auth_method(list);

    /**
     * Lazy-loading for the list
     * @param node - node to load
     * @param callback - callback run after children are loaded
     */
    var lazy_list = function(options, node, callback) {
        var folder = node.id === '#' ? 'root' : node.id;
        var options = {
            folder: folder,
            pdfOnly: options.pdfOnly,
            writeOnly: options.writeOnly
        };
        module.list(function(item) {
            var loaded_node = module.convert_to_jstree(item);
            callback.call(this, node.id === '#' ? loaded_node : loaded_node.children);
        }, options);
    };

    /**
     * Convert a file/folder to a jstree node
     */
    module.convert_to_jstree = function(item) {
        var children = item.children.map(module.convert_to_jstree);
        var result = {
            text: item.title + (item.disabled ? ' (no permissions)' : ''),
            id: item.id,
            data: item,
            type: item.isFolder ? 'default' : (item.shared ? 'shared-file' : 'file'),
            state: {
                opened: item.isRoot,
                disabled: item.disabled
            }
        };
        if (children.length) {
            result.children = children;
        }
        else {
            result.children = item.isFolder;
        }
        return result;
    };

    return module;

});