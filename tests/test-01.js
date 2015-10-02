
/*
 * 
 */

var Now = require('../dist/now.js');

describe('Simple test of the methods "wait" and "then"', function() {

	/* 
	 * Simple testing of the methods 'wait'
	 */
	it('should work fine', function(done) {
		
		Now
			.wait(100).then(function() {
				done();
			});
		
	});

	/* 
	 * Testing methods and preserving 'this'
	 */
	it('with preserved "this"', function(done) {
		
		Now
			.wait(100).then(function() {
				this.a = 1;
			})
			.wait(100).then(function() {
				done();

				if (JSON.stringify(this) !== '{"a":1}') {
					console.log( '\tUnexpected value!' );
				}
			});
		
	});

});

