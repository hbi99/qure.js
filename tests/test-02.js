
/*
 *  
 */

var qure = require('../src/qure.js');

describe('Testing I/O blocking recursion', function() {

	/* 
	 * Simple testing of recursion with fibonacci numbers
	 */
	it('with fibonacci numbers', function(done) {
		
		qure
			.declare({
				// declare type (omitted or false = not threaded)
				workers: false,
				// fibonacci numbers
				fibonacci: function(n) {
					return (n < 2) ? 1 : this.fibonacci(n-2) + this.fibonacci(n-1);
				},
				// factorial numbers
				factorial: function(n) {
					return (n <= 0) ? 1 : (n * this.factorial(n - 1));
				}
			})
			.run('factorial', 6)
			.then(function(res) {
				// verify the result
				if (res !== 720) {
					console.log( '\tUnexpected value!' );
				}
			})
			.run('fibonacci', 7)
			.then(function(res) {
				// verify the result
				if (res !== 21) {
					console.log( '\tUnexpected value!' );
				}
				done();
			});
		
	});

});

