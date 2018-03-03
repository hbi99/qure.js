
/*
 * 
 */

var qure = require('../src/qure.js');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('exit functionality', function(done) {
		
		qure
			.declare({
				test: function(a) {
					console.log(a);
				}
			})
			.run('test', 1)
			.exit()
			.then(function() {
				console.log(3);
			});

		qure.fork()
			.wait(1000)
			.then(function() {
				console.log(2);
				done();
			});

	});

});

