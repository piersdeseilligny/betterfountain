define(function(require) {

    var Protoplast = require('protoplast'),
        SettingsPanelItem = require('plugin/settings/view/settings-panel-item');

    var SettingsPanelSection = Protoplast.Component.extend({

        html: '<tbody><tr><th colspan="2" data-prop="header"></th></tr></tbody>',

        /**
         * Group to be displayed
         */
        group: null,

        init: function() {
            Protoplast.utils.bind(this, 'group', this.render.bind(this));
        },

        render: function() {
            this.header.innerHTML = this.group.title;
            (this.group.entries || []).forEach(this.addRow, this);
        },

        addRow: function(entry) {
            var item = SettingsPanelItem.create();
            item.label = entry.label;
            item.control = entry.control;
            item.key = entry.key;

            item.on('configValueChanged', function(event) {
                this.dispatch('configValueChanged', event);
            }.bind(this));
            this.add(item);
        }

    });

    return SettingsPanelSection;
});