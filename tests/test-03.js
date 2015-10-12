
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing recursion', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.declare({
				init: function() {
					this.fs = require('fs');
				},
				parseDir: function(path, list) {
					if (typeof(path) === 'string') {
						this.fs.readdir(path, function(err, list) {
							console.log(list);
							self(list);
						});
						return;
					}
					if (list && list.length) {
						return list;
					}
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

