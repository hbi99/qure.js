
/*
 *  
 */

var Qure = require('../src/qure.js');

describe('Testing threaded recursion', function() {

	/* 
	 * Simple testing of recursion with fibonacci numbers
	 */
	it('with fibonacci numbers', function(done) {

		// extend test timeout to 15 seconds
		this.timeout(15000);
		
		Qure
			.declare({
				// fibonacci numbers
				fibonacciWorker: function(n) {
					return (n < 2) ? 1 : this.fibonacciWorker(n-2) + this.fibonacciWorker(n-1);
				},
				// factorial numbers
				factorialWorker: function(n) {
					return (n <= 0) ? 1 : (n * this.factorialWorker(n - 1));
				}
			})
			.run('factorialWorker', 6)
			.then(function(res) {
				// verify the result
				if (res !== 720) {
					console.log( '\tUnexpected value!' );
				}
			})
			.run('fibonacciWorker', 41)
			.then(function(res) {
				// verify the result
				if (res !== 267914296) {
					console.log( '\tUnexpected value!' );
				}
				done();
			});
		
	});

});

