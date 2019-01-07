/**
 * Development Bootstrap. Additional DevController is added for dev specific behaviour.
 */
require(['dependencies', 'bootstrap', 'bootstrap/dev-config'], function (_, Bootstrap, DevConfig) {
    Bootstrap.init(DevConfig);
});