define(function() {

    /**
     * Functional helpers
     * @exports utils/fn
     */
    var fn = {};

    /**
     * Conflates calls for "paginated" calls, for example Dropbox API returns
     * For more details - see the test.
     * {has_more: true, changes: [...]} if there are more results to poll, and
     * {has_more: false, changes: [...]} if there are no more results.
     *
     * @param {Function}   caller   function used to make the call, caller(conflate_callback, last_response_arg1, last_response_arg2...) - conflate callback should be used as the main callback for the action
     * @param {Function}   tester   function that should return true if another call should be takes, tester(last_response_arg1, last_response_arg2...)
     * @param {Function}   final_callback   function that will be called after all results are collected, accepts on argument with list of all response arguments passed to the result callback: final_callback([[first_response_arg1, first_response_arg2...],[second_response_arg1, second_response_arg2, ...],...).
     */
    fn.conflate = function(caller, tester, final_callback) {
        var all_results = [];

        var conflate_callback = function() {
            var args = Array.prototype.slice.call(arguments);
            all_results.push(args);
            if (tester.apply(null, args)) {
                caller.apply(null, [conflate_callback].concat(args));
            } else {
                final_callback(all_results);
            }
        };

        caller(conflate_callback, null);
    };

    return fn;
});