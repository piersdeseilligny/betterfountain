define(function(require) {

    var Protoplast = require('protoplast'),
        SettingsPanelPresenter = require('plugin/settings/view/settings-panel-presenter'),
        SettingsPanelGroup = require('plugin/settings/view/settings-panel-group');

    var SettingsPanel = Protoplast.Component.extend({

        $meta: {
            presenter: SettingsPanelPresenter
        },

        html: '<div class="settings-panel"><table data-comp="table"></table></div>',

        config: null,

        table: {
            component: Protoplast.Component.extend({tag:'table'})
        },

        layoutReady: false,

        $create: function() {
            this.config = Protoplast.Collection.create([]);
        },

        init: function() {
            Protoplast.utils.renderList(this, 'config', {
                parent: this.table,
                renderer: SettingsPanelGroup,
                property: 'group',
                create: function(parent, data, renderer, propertyName) {
                    var child = renderer.create();
                    child[propertyName] = data;
                    child.on('configValueChanged', function(event) {
                        parent.dispatch('configValueChanged', event);
                    });
                    parent.add(child);
                }
            });

            this.table.on('configValueChanged', function(event) {
                this.dispatch('configValueChanged', event);
            }.bind(this));
        }

    });

    return SettingsPanel;
});