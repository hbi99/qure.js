
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('sequence', function(done) {
		
		Qure
			.sequence('test1', function(arg) {
				
				this.wait(500)
					.then(function() {
						console.log(arg);
					});

			})
			.sequence('test2', function(arg) {
				
				this.wait(1000)
					.then(function() {
						console.log(arg);
						done();
					});

			});

		Qure.run('test1', 5);
		Qure.run('test2', 10);

	});

});

