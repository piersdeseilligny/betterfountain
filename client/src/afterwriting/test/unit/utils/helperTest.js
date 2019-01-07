define(['utils/helper'],function (helper) {
	
	describe('Time Helper', function () {

		it('formats time', function () {
			chai.assert.equal(helper.format_time(1.1), '01:06');
		});

		it('blanks provided text', function() {
			chai.assert.equal(helper.blank_text("foobar"), "      ");
			chai.assert.equal(helper.blank_text("  foo  bar  "), "            ");
		});

		it('returns text indentation', function() {
			chai.assert.equal(helper.get_indentation("   foo  bar  "), "   ");
			chai.assert.equal(helper.get_indentation("foo  bar  "), "");
		});

	});

});