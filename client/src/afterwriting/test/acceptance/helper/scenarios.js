define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * More complex step converted into functions
     * 
     * If WHEN, GIVEN or THEN section of acceptance test is longer than 4 lines it should be converted to a scenario function
     */
    var Scenarios = Protoplast.extend({
        
        env: null,
        
        $create: function(env) {
            this.env = env;
        },
        
        load_local_file: function(file, callback) {
            var env = this.env;
            
            env.browser.has_local_file(file);
            env.user.theme.open_plugin('open');

            env.user.open.open_local_file(file.name);
            env.browser.read_files(function() {
                env.browser.tick(3000);
                callback();
            });
        },

        load_dropbox_file: function(file, callback) {
            var env = this.env;

            env.dropbox.has_file(file);
            env.user.theme.open_plugin('open');

            env.user.open.open_from_dropbox();
            env.dropbox.auth_dropbox();
            env.browser.tick(3000);
            env.user.popup.select_file(file.name);
            env.user.popup.confirm_popup();

            env.browser.read_files(function() {
                env.browser.tick(3000);
                callback();
            });
        },

        load_google_drive_file: function(file, callback) {
            var env = this.env;

            env.google_drive.has_file(file);
            env.user.theme.open_plugin('open');

            env.user.open.open_from_googledrive();
            env.google_drive.auth_google_drive();
            env.browser.tick(3000);
            env.user.popup.select_file(file.name);
            env.user.popup.confirm_popup();
            env.google_drive.auth_google_drive();
            env.browser.tick(3000);
            
            env.browser.read_files(function() {
                env.browser.tick(3000);
                callback();
            });
        },

        /**
         * Changes content of the the file and waits for the readers to read the content when synchronisation is on
         * @param {string} filename
         * @param {string} new_content
         * @param {function} callback
         */
        dropbox_file_changes: function(filename, new_content, callback) {
            var env = this.env;
            
            env.dropbox.content_change(filename, new_content);
            env.browser.tick(10000);
            env.browser.read_files(function() {
                env.browser.tick(3000);
                callback();
            });
        },

        /**
         * Create new script with a given text as content
         * @param {string} text
         */
        create_new_script: function(text) {
            var env = this.env;

            env.user.theme.open_plugin('open');
            env.user.open.create_new();
            env.user.theme.open_plugin('editor');
            env.user.editor.set_editor_content(text);
        },

        /**
         * Creates a new script and triggers saving to dropbox in given format
         */
        initialise_saving_to_dropbox: function(format) {
            var env = this.env;

            env.user.theme.open_plugin('open');
            env.user.open.create_new();
            env.user.theme.open_plugin('save');
            if (format === 'pdf') {
                env.user.save.save_pdf_dropbox('save');
            }
            else if (format === 'fountain') {
                env.user.save.save_fountain_dropbox('save');
            }
            env.dropbox.auth_dropbox();
            env.browser.tick(3000);
        }
        
    });

    return Scenarios;
});