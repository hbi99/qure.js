
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing load method (single file)', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.load('../demo/test1.json')
			.then(function(res) {
				console.log(res);
				done();
			});
		
	});

});

