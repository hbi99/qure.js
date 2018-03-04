
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
				console.log(1);

				qure.abort(function() {
					console.log('aborted');
					done();
				});
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

