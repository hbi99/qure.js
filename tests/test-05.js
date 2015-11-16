
/*
 *  
 */

var Qure = require('../src/qure.js');

describe('Testing threaded recursion', function() {

	/* 
	 * Simple testing of recursion with fibonacci numbers
	 */
	it('with fibonacci numbers', function(done) {
		
		Qure
			.declare({
				// fibonacci numbers
				WRK_fibonacci: function(n) {
					return (n < 2) ? 1 : this.WRK_fibonacci(n-2) + this.WRK_fibonacci(n-1);
				},
				// factorial numbers
				WRK_factorial: function(n) {
					return (n <= 0) ? 1 : (n * this.WRK_factorial(n - 1));
				}
			})
			.run('WRK_factorial', 6)
			.then(function(res) {
				// verify the result
				if (res !== 720) {
					console.log( '\tUnexpected value!' );
				}
			})
			.run('WRK_fibonacci', 7)
			.then(function(res) {
				// verify the result
				if (res !== 21) {
					console.log( '\tUnexpected value!' );
				}
				done();
			});
		
	});

});

