
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Loading external javascript resource', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.load('../demo/js/test2.js')
			.then(function(res) {
				if (res.foo() !== 'bar') {
					console.log( '\tUnexpected value!' );
				}
				done();
			});
		
	});

});

