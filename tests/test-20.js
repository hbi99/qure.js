
/*
 * 
 */

var qure = require('../src/qure.js'),
	qureDefiant = require('qure-defiant');

describe('Testing', function() {

	/* 
	 * 
	 */
	it('defiant.js', function(done) {
		
		var data = {
			"a": {
				"b": 1
			}
		};

		qure
			.declare(qureDefiant)
			.run('defiant', data, '//*')
			.then(function(res) {
				done();
				// verify the result
				if (JSON.stringify(res) !== '[{"a":{"b":1}},{"b":1},1]') {
					console.log( '\tUnexpected value!' );
				}
			});
		
	});

});
