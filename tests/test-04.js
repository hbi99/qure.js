
/*
 * 
 */

var Qure = require('../src/qure.js');

describe('Testing I/O blocking recursion', function() {

	/* 
	 * 
	 */
	it('on filesystem', function(done) {
		
		Qure
			.declare({
				// declare type (omitted or false = not threaded)
				workers: false,
				// declare functions
				readdir: function(path, list) {
					var that = this;

					// prerequisites
					this.fs   = require('fs');
					this.path = require('path');

					// normalize path
					path = this.path.normalize(path);

					// pause the queue
					this.pause();
					
					// make async call
					this.walk(path, function(err, list) {
						// resume queue
						that.resume(list);
					});
				},
				walk: function(path, callback, level) {
					var that = this,
						results = [],
						fs = this.fs,
						sep = '/';
					fs.readdir(path, function(err, list) {
						if (err) return callback(err);
						var pending = list.length;
						if (!pending) return callback(null, results);
						list.forEach(function(file) {
							file = path + sep + file;
							fs.stat(file, function(err, stat) {
								if (stat && stat.isDirectory()) {
									results.push(file);
									if (level === 1) {
										if (!--pending) callback(null, results);
										return;
									}
									that.walk(file, function(err, res) {
										results = results.concat(res);
										if (!--pending) callback(null, results);
									});
								} else {
									results.push(file);
									if (!--pending) callback(null, results);
								}
							});
						});
					});
				}
			})
			.run('readdir', __dirname +'/../demo')
			.then(function(res) {
				// print out directory listing
				console.log(res);
				// send 'finished' signal to unit-tester
				done();
			});
		
	});

});

