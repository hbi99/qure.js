
/*
 * 
 */

var qure = require('../src/qure.js');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('sequence', function(done) {
		
		qure
			.sequence('test1', function(arg) {
				
				// notice that "this" context is "Qure"
				this.wait(500)
					.then(function() {
						console.log(arg);
					});

			})
			.sequence('test2', function(arg) {
				
				// notice that "this" context is "Qure"
				this.wait(1000)
					.then(function() {
						console.log(arg);
						done();
					});

			});

		qure.run('test1', 5);
		qure.run('test2', 10);

	});

});

