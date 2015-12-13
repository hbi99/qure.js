
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
				method : 'POST',
				url  : 'http://sandbox/node-response/post.php',
			//	url  : '../demo/test1.json',
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

