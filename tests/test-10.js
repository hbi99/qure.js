
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing require method, geting json file', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.xhr({
				url  : 'http://sandbox/node-response/get.php',
				data : {
					"foo": "bar"
				}
			})
			.then(function(res) {
				console.log(res);
				done();
			});
		
	});

});

