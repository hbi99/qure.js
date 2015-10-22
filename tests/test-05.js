
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing thread support', function() {

	/* 
	 * 
	 */
	it('with query', function(done) {
		
		Qure
			.thread({
				// fibonacci numbers
				fibonacci: function(n) {
					return (n < 2) ? 1 : self(n-2) + self(n-1);
				},
				loop: function(len) {
					while (len--) {}
					return 2;
				}
			})
			//.run('loop', 1000000)
			.run('fibonacci', 37)
			.then(function(res) {
				console.log(res);
				// 39088169
				done();
			});
		
	});

});

