
/*
 * 
 */

var qure = require('../src/qure.js'),
	qureMysql = require('qure-mysql');

describe('Testing threaded database with external module', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		qure
			.declare(qureMysql)
			.run('settings', {
				host:     'localhost',
				user:     'me',
				password: 'secret',
				database: 'my_db'
			})
			.run('query', 'SELECT 1 + 1 AS solution;')
			.then(function(rows) {
				console.log('The solution is: ', rows.solution);
				done();
			});
		
	});

});

