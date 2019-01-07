define(function(require) {

    var $ = require('jquery');

    var module = {};

    var parent_folder_for_new, new_id;

    var select_and_scroll = function(node) {
        if (!node.state.disabled) {
            $('#jstree').jstree(true).select_node(node.id);
        }

        var parent_top = $('#jstree-parent').position().top;
        var element_top = $('#jstree li[id="' + node.id + '"').position().top;
        var parent_half_height = $('#jstree-parent').height() / 2;
        $('#jstree-parent').scrollTop(element_top - parent_top - parent_half_height);
    };

    module.show = function(options) {
        var buttons = {};
        buttons[options.label || 'Save'] = true;
        buttons['Cancel'] = false;
        var info = '<p>' + options.info + '</p>';
        $.prompt(info + '<div id="jstree-parent"><div id="jstree"></div></div>', {
            buttons: buttons,
            submit: function(e, v) {
                if (v) {
                    var selected = $('#jstree').jstree(true).get_selected(true);
                    if (selected.length) {
                        if (options.save && selected[0].id !== new_id && selected[0].data.isFolder) {
                            parent_folder_for_new = selected[0];
                            e.preventDefault();
                            $('#jstree').jstree(true).open_node(selected[0].id);
                            $('#jstree').jstree(true).deselect_node(selected[0].id);
                            $('#jstree').jstree(true).create_node(selected[0].id, {
                                text: options.filename || "newfile",
                                type: "file"
                            }, "first", function(node) {
                                new_id = node.id;
                                $('#jstree').jstree(true).select_node(new_id);
                                $('#jstree').jstree(true).edit(new_id);
                            });
                        } else {
                            if (options.save && selected[0].id === new_id) {
                                options.callback(parent_folder_for_new, selected[0].text);
                            } else {
                                options.callback(selected[0]);
                            }
                        }
                    } else {
                        $.prompt("You didn't select anything.");
                    }

                } else {
                    $.prompt.close();
                }
            },
            loaded: function() {
                $('#jstree').jstree({
                    plugins: ['types', 'search'],
                    core: {
                        data: options.data,
                        check_callback: true,
                        multiple: false
                    },
                    search: {
                        show_only_matches: true,
                        search_leaves_only: true
                    },
                    types: {
                        "default": {
                            "valid_children": ["default", "file", "shared-file"],
                            "icon": "aw-jstree-folder"
                        },
                        "file": {
                            "icon": "aw-jstree-file"
                        },
                        "shared-file": {
                            "icon": "aw-jstree-shared-file"
                        }
                    }
                }).on('ready.jstree', function() {
                    if (options.search) {
                        var search_input = $('<p>find: <input class="popup_search_bar"/> (min. 3 characters)</p>');

                        search_input.find('input').keyup(function() {
                            var query = $(this).val();
                            if (query.length >= 3) {
                                $('#jstree').jstree(true).search(query);
                            }
                        });

                        search_input.insertBefore('#jstree-parent');
                    }
                    if (options.selected) {
                        var node_to_select = $('#jstree').jstree(true).get_node(options.selected);

                        if (!node_to_select) {
                            var parents = options.selected_parents.split(',');
                            var open_next = function() {
                                if (parents.length) {
                                    $('#jstree-parent').css('opacity', 0.4);
                                    $('#jstree').jstree(true).open_node(parents.shift(), open_next, 0);
                                }
                                else {
                                    $('#jstree-parent').css('opacity', 1);
                                    node_to_select = $('#jstree').jstree(true).get_node(options.selected);
                                    select_and_scroll(node_to_select);
                                }
                            };
                            open_next();
                        }
                        else {
                            select_and_scroll(node_to_select);
                        }
                    }
                }).on('changed.jstree', function() {
                    var selected = $('#jstree').jstree(true).get_selected();
                    if (selected[0] !== new_id) {
                        $('#jstree').jstree(true).delete_node(new_id);
                    }
                });
            }
        });

    };

    return module;

});