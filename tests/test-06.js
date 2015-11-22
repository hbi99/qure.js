
/*
 * 
 */

var Qure = require('../src/qure.js'),
	qureFs = require('qure-fs');

describe('Testing threaded recursion with external module', function() {

	/* 
	 * 
	 */
	it('on file system', function(done) {
		
		Qure
			.declare(qureFs)
			.run('readdirWorker', __dirname +'/../demo')
			.then(function(res) {
				// print out directory listing
				console.log(res);
				// send 'finished' signal to unit-tester
				done();
			});
		
	});

});

