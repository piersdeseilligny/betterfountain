/**
 * Main application bootstrap.
 */
require(['dependencies', 'bootstrap', 'bootstrap/app-config'], function (_, Bootstrap, AppConfig) {
    Bootstrap.init(AppConfig);
});