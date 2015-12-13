
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
			//.require('../demo/test1.json')
			.xhr({
				url  : '../demo/test1.json',
				data : {
					"foo": "bar"
				}
			})
			.then(function(rows) {
				console.log(rows);
				done();
			});
		
	});

});

