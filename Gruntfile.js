
module.exports = function (grunt) {
	'use strict';

	grunt.initConfig({

		// metadata
		pkg : grunt.file.readJSON('package.json'),
		meta: {
			copyright : 'Copyright (c) 2013-<%= grunt.template.today("yyyy") %>',
			banner    : '/* \n' +
						' * QureJS v<%= pkg.version %> \n' +
						' * <%= pkg.description %> \n' +
						' * <%= pkg.homepage %> \n' +
						' * \n' +
						' * <%= meta.copyright %>, <%= pkg.author.name %> <<%= pkg.author.email %>> \n' +
						' * Licensed under the <%= pkg.license.type %> License \n' +
						' */ \n',
			source    : [
						'src/qure.js'
						]
		},

		// JShint source
		jshint: {
			files: {
				src: ['Gruntfile.js', 'src/*', 'tests/*']
			}
		},

		// concatenation source files
		concat: {
			options: {
				stripBanners: 'all',
				banner: '<%= meta.banner %>'
			},
			// concat latest
			latest: {
				src: '<%= meta.source %>',
				dest: 'dist/qure.js'
			}
		},

		// uglifying concatenated file
		uglify: {
			options: {
				banner: '<%= meta.banner %>',
				mangle: true
			},
			// uglify latest
			latest: {
				src: ['<%= concat.latest.dest %>'],
				dest: 'dist/qure.min.js'
			}
		},

		// test tasks
		mochaTest : {
			all: {
				options: {
					//reporter: 'progress'
					reporter: 'list'
				},
				src: [
					'tests/test-02.js'
				]
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-mocha-test');

	// tests
	grunt.registerTask('hint', [ 'jshint' ]);
	grunt.registerTask('test', [ 'mochaTest' ]);

	// version deployment
	grunt.registerTask('default', [
		'jshint',
		'concat:latest',
		'uglify:latest'
	]);

};

