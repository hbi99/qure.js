
/*
 * 
 */

var qure = require('../src/qure.js');

describe('Testing load method (single file)', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		qure
			.load(__dirname +'/../demo/json/test1.json')
			.then(function(res) {
				console.log(res);
				done();
			});
		
	});

});

