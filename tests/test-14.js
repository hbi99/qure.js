
/*
 * 
 */

var qure = require('../src/qure.js');

describe('Loading external javascript resource', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		qure
			.load(__dirname +'/../demo/js/test2.js')
			.then(function(res) {
				console.log(res);
				done();
			});
		
	});

});

