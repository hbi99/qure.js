
/*
 * 
 */

var qure = require('../src/qure.js');

describe('Testing XHR, with GET method', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		qure
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

