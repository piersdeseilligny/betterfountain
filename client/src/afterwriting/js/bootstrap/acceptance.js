/**
 * Acceptance tests bootstrap. Unlike other bootstraps it doesn't create the app straight away. The app is created
 * by Env before each test.
 *
 * @see Env
 */
require(['dependencies', 'bootstrap', 'bootstrap/dev-config', '../test/acceptance/setup'], function (_, Bootstrap, DevConfig, AcceptanceTestsSetup) {
    var setup = AcceptanceTestsSetup.create(Bootstrap, DevConfig);
    setup.run();
});