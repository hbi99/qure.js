
/*
 * 
 */

var Qure = require('../src/qure.js'),
	qureMysql = require('qure-mysql');

describe('Testing threaded database with external module', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.declare(qureMysql)
			.run('query', 'SELECT 1 + 1 AS solution')
			.then(function(rows) {
				console.log('The solution is: ', rows[0].solution);
				done();
			});
		
	});

});

