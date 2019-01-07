define(function(require) {

    var _ = require('lodash'),
        Protoplast = require('protoplast');

    var PrintProfileUtil = Protoplast.extend({

        /**
         * Create new profile based on a given sourceProfile and change the font size
         *
         * @param {object} sourceProfile
         * @param {number} fontSize
         *
         * @returns {object}
         */
        withNewFontSize: function(sourceProfile, fontSize) {

            var profile = _.cloneDeep(sourceProfile);
            
            var up = fontSize / profile.font_size,
                down = profile.font_size / fontSize;

            profile.font_size = fontSize;
            profile.lines_per_page = Math.floor(profile.lines_per_page * down);
            profile.font_width = profile.font_width * up;
            profile.font_height = profile.font_height * up;

            Object.keys(profile).forEach(function(key) {
                if (typeof (profile[key]) === "object") {
                    profile[key].max = Math.floor(profile[key].max * down);
                }
            });

            return profile;
        }

    });

    return PrintProfileUtil;
});