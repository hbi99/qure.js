
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing recursion', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		var tmp = Qure
			.declare({
				init: function() {
					this.fs = require('fs');
				},
				parseDir: function(path, list) {
					console.log(tmp);
					
				}
			})
			.run('init')
			.run('parseDir', __dirname +'/..')
			.then(function(res) {
				console.log(res);
				done();
			});
		
	});

});

