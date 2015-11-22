
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing threaded database with external module', function() {

	/* 
	 * 
	 */
	it('with query', function(done) {
		
		Qure
			.declare({
				open: function() {
					this.mysql = require('mysql');
					this.conn = this.mysql.createConnection({
						host     : 'localhost',
						user     : 'me',
						password : 'secret',
						database : 'my_db'
					});
				},
				query: function(query) {
					var that = this;

					// pause the queue
					this.pause();

					// open database connection
					this.open();

					// execute query
					this.conn.query(query, function(err, rows, fields) {
						if (err) throw err;

						// close database connection
						that.conn.end();

						// resume queue
						that.resume(rows);
					});
				}
			})
			.run('query', 'SELECT 1 + 1 AS solution')
			.then(function(rows) {
				console.log('The solution is: ', rows[0].solution);
				done();
			});
		
	});

});
