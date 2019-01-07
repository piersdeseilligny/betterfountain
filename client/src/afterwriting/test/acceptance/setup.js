define(['../../test/acceptance/tests', 'protoplast'], function (_, Protoplast) {
    
    var AcceptanceTestsSetup = Protoplast.Object.extend({
        
        $create: function(Bootstrap, Config) {
            if (window.ACCEPTANCE) {
                // XXX: fake timer created to skip the animation at the beginning
                window.clock = sinon.useFakeTimers();
                window.testData = {
                    Bootstrap: Bootstrap,
                    Config: Config
                }
            }
        },
    
        run: function() {
            if (window.ACCEPTANCE) {
                window.clock.tick(5000);
                window.clock.restore();
                mocha.run();
            }
        }
        
    });

    return AcceptanceTestsSetup;
});
