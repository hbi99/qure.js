
/*
 * 
 */

var qure = require('../src/qure.js');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('abort functionality', function(done) {
		
		qure
			.declare({
				test: function(a) {
					console.log(a);

					//this.abort();
				}
			})
			.then(function() {
				done();
				qure.abort();
				console.log('aborted');
			})
			.run('test', 2)
			.then(function() {
				console.log(11);
			})
			.then(function() {
				console.log(3);
			});

	});

});

