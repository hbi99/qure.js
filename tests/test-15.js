
/*
 * 
 */

var qure = require('../src/qure.js');

describe('Loading HTML file', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		qure
			.load(__dirname +'/../demo/html/index.htm')
			.then(function(res) {
				console.log(res);
			//	if (res.foo() !== 'bar') {
			//		console.log( '\tUnexpected value!' );
			//	}
				done();
			});
		
	});

});

