
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Trying out', function() {

	/* 
	 * 
	 */
	it('rendering less file', function(done) {
		
		Qure
			.declare({
				render: function(options) {
					console.log(options);
				}
			})
			.run('render', {
				source: '../demo/css/*.less',
				compress: false
			})
			.then(function(data) {
				console.log(data);
				
				done();
			});

	});

});

