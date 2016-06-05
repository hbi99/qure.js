
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('simple sequence', function(done) {
		
		Qure
			.sequence('test', function() {
				console.log(this);
			});
		
		done();

	});

});

