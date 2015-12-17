
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing load method (multiple files)', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.load({
				'test1': '../demo/test1.json',
				'test2': '../demo/test2.json'
			})
			.then(function(res) {
				console.log(res);
				done();
			});
		
	});

});

