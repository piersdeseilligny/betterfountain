define(function(require) {

    var Protoplast = require('protoplast');

    var SettingsWidgetModel = Protoplast.Model.extend({
        
        /**
         * @type {SettingsGroup[]}
         */
        groups: null,

        $create: function() {
            this.groups = Protoplast.Collection.create([]);
        },

        getSettingEntry: function(key) {
            var result = null;
            this.groups.forEach(function(group) {
                group.entries.forEach(function(entry) {
                    if (entry.key === key) {
                        result = entry;
                    }
                });
            });
            return result;
        }

    });

    return SettingsWidgetModel;
});