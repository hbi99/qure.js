
/*
 * 
 */

var qure = require('../src/qure.js'),
	qureMysql = require('qure-mysql');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('abort functionality', function(done) {
		
		qure
			.declare({
				test: function(a) {
					console.log(a);
				}
			})
			.run('test', 2)
			.then(function() {
				qure.abort(function() {
					console.log('aborted');
					done();
				});
			})
			.then(function() {
				console.log(3);
			});

	});

});

