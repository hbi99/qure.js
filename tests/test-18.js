
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
			.then(function() {
				console.log(1);

				qure.exit(function() {
					console.log('exited');
					done();
				});
			})
			.run('test', 2)
			.then(function() {
				console.log(3);
			});

	});

});

