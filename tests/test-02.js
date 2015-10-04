
/*
 * 
 */

var Qure = require('../dist/qure.js');

describe('Testing ajax loading', function() {

	/* 
	 * Simple testing of the method 'load'
	 */
	it('simple test should work fine', function(done) {
		
		Qure
			.load('./demo/test1.json')
			.then(function(data) {
				console.log(data);
			});
		
	});

});

