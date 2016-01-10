
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
				settings: function(conn) {
					this.conn = conn;
				},
				open: function() {
					this.mysql = require('mysql');
					this.conn = this.mysql.createConnection({
						host     : this.conn.host,
						user     : this.conn.user,
						password : this.conn.password,
						database : this.conn.database
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
			.run('settings', {
				host:     'localhost',
				user:     'me',
				password: 'secret',
				database: 'my_db'
			})
			.run('query', 'SELECT 1 + 1 AS solution')
			.then(function(rows) {
				console.log('The solution is: ', rows[0].solution);
				done();
			});
		
	});

});
