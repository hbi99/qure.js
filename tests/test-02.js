
/*
 * 
 */

var Now = require('../dist/now.js');

describe('Testing ajax loading', function() {

	/* 
	 * Simple testing of the method 'load'
	 */
	it('simple test should work fine', function(done) {
		
		Now
			.load('./demo/test1.json')
			.then(function(data) {
				console.log(data);
			});
		
	});

});

