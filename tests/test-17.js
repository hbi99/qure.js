
/*
 * 
 */

var qure = require('../src/qure.js'),
	qureWatch = require('qure-watch');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('watching less file', function(done) {
		
		qure
			.declare(qureWatch)
			.run('watch', {
				source: '../demo/css/*.less'
			})
			.then(function(data) {
				console.log(data);

				done();
			});

	});

});

