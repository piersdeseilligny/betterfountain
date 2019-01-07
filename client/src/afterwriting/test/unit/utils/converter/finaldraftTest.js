define(['utils/converters/finaldraft',
	    'test_screenplays'], function (converter, screenplays) {

	function get_scripts(name) {
		return {
			fdx: screenplays['test/data/screenplays/fdx/' + name + '.fdx'](),
			fountain: screenplays['test/data/screenplays/fdx/' + name + '.fountain']()
		};
	}
	
	function print_expected(a,b) {
		return '\nEXPECTED:\n' + a + '\nACTUAL:\n' + b + '\n';
	}

	function compare_fountains(a, b) {
		var a_lines = a.match(/[^\r\n]+/g);
		var b_lines = b.match(/[^\r\n]+/g);
		if (a_lines.length !== b_lines.length) {
			chai.assert.fail(false, 'Different number of lines ' + a_lines.length + ' / ' + b_lines.length + print_expected(a,b));
		}
		for (var i=0; i<a_lines.length; i++) {
			if (a_lines[i].trim() !== b_lines[i].trim()) {
				chai.assert.ok(false, 'Assert error at line ' + i + ':\n' + print_expected(a_lines[i], b_lines[i]));
			}
		}
	}
	
	describe('FinalDraft Converter', function () {

		it('converts notes saved in paragraph to inline notes', function () {
			var scripts = get_scripts('note');

			var fountain = converter.to_fountain(scripts.fdx);

			compare_fountains(fountain, scripts.fountain);
		});

		it('converts synopsis', function () {
			var scripts = get_scripts('synopsis');

			var fountain = converter.to_fountain(scripts.fdx);

			compare_fountains(fountain, scripts.fountain);
		});

		it('coverts header notes', function () {
			var scripts = get_scripts('header_note');

			var fountain = converter.to_fountain(scripts.fdx);

			compare_fountains(fountain, scripts.fountain);
		});

	});

});