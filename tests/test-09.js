
/*
 * 
 */

var qure = require('../src/qure.js'),
	qureMysql = require('qure-mysql');

var loop = [
	"SELECT 1 + 1 AS solution;",
	"SELECT 2 + 2 AS solution;"
];

qure
	.declare(qureMysql)
	.run('settings', {
		host:     'localhost',
		user:     'me',
		password: 'secret',
		database: 'my_db'
	})
	.run('multiQuery', loop)
	.then(function(results) {
		console.log(results);
	});
