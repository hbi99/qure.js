
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing XHR, with POST method', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.xhr({
				headers : {
					'Authorization' : 'Bearer xxxx'
				},
				url : 'http://sandbox/node-response/get.php'
			})
			.then(function(res) {
				console.log(res);
				done();
			});
		
	});

});

