define(['utils/fn'], function (fn) {

	describe('fn', function () {

		var fake_client;

		beforeEach(function () {
			fake_client = {};
			fake_client.action = function (page, callback) {
				page = page || 3;
				page--;
				callback({
					more: page !== 0,
					next_page: page
				});
			};
		});

		it('conflates all handlers', function () {

			var final_result = null;
			var final_callback = function (result) {
				final_result = result;
			};

			fn.conflate(function (conflate_callback, last_result) {
				fake_client.action(last_result ? last_result.next_page : null, conflate_callback);
			}, function (result) {
				return result.more;
			},
				final_callback);

			chai.assert.isNotNull(final_result);
			chai.assert.lengthOf(final_result, 3);
			chai.assert.equal(final_result[0][0].next_page, 2);
			chai.assert.equal(final_result[0][0].more, true);
			chai.assert.equal(final_result[1][0].next_page, 1);
			chai.assert.equal(final_result[1][0].more, true);
			chai.assert.equal(final_result[2][0].next_page, 0);
			chai.assert.equal(final_result[2][0].more, false);
		});

	});

});