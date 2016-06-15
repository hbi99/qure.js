
'use strict';

var gulp                       = require('gulp'),
	$                          = require('gulp-load-plugins')(),
	gutil                      = require('gulp-util'),
	colors                     = require('colors'),
	fs                         = require('fs'),
	stylish                    = require('jshint-stylish'),
	runSequence                = require('run-sequence'),
	conventionalChangelog      = require('gulp-conventional-changelog'),
	conventionalGithubReleaser = require('conventional-github-releaser');


var DATE  = new Date(),
	SRC   = 'src/qure.js',
	DEST  = 'dist/',
	TESTS = 'tests/*.js',
	HINTS = ['./src/*', './tests/*'],
	PKG   = JSON.parse(fs.readFileSync('./package.json', 'utf8'));


var banner   = ['/*',
				' * <%= name %>.js [v<%= version %>]',
				' * <%= homepage %> ',
				' * Copyright (c) 2013-'+ DATE.getFullYear() +', <%= author.name %> <<%= author.email %>> \n' +
				' * Licensed under the <%= license %> License',
				' */',
				''].join('\n');


// help instructions
gulp.task('help', function() {
	console.log('  gulp tests'.cyan          +'\t\tRun all tests'.grey);
	console.log('  gulp test --file 01'.cyan +'\tRun specific file'.grey);
	console.log('  gulp hint'.cyan           +'\t\tJSHint source files'.grey);
	console.log('  gulp minify'.cyan         +'\t\tMinify and JSHint files'.grey);
	console.log('  gulp commit'.cyan         +'\t\tCommit and bump version'.grey);
	console.log('  gulp release'.cyan        +'\t\tCommit, bump, push and release version'.grey);
});


/* 
 * this task executes all tests -
 * unless it is called with argument:
    gulp tests --file 01
 */
gulp.task('tests', function() {
	return gulp.src(TESTS, {read: false})
				.pipe($.mocha({reporter: 'list'}));
});


gulp.task('test', function() {
	var nr = process.argv.slice(2)[2],
		src = nr.match(/\d\d/) === null ? nr : 'test-'+ nr ;
	return gulp.src('tests/'+ src +'.js', {read: false})
				.pipe($.mocha({reporter: 'list'}));
});


gulp.task('hint', function() {
	return gulp.src(HINTS)
				.pipe($.jshint())
				.pipe($.jshint.reporter('jshint-stylish'));
});


gulp.task('minify', function() {
	return gulp.src(SRC)
				.pipe($.jshint())
				.pipe($.jshint.reporter('jshint-stylish'))
				.pipe($.header(banner, PKG))
				.pipe(gulp.dest(DEST))
				.pipe($.uglify())
				.pipe($.header(banner, PKG))
				.pipe($.rename({ extname: '.min.js' }))
				.pipe(gulp.dest(DEST));
});


gulp.task('changelog', function() {
	return gulp.src('CHANGELOG.md', {buffer: false})
				.pipe(conventionalChangelog({preset: 'angular'}))
				.pipe(gulp.dest('./'));
});


gulp.task('github-release', function(done) {
	conventionalGithubReleaser({
		type: "oauth",
		token: '46e1c77d2e11dd7402f0346923fa53731a1f88a4'
	}, {preset: 'angular'}, done);
});


gulp.task('bump-version', function() {
	// We hardcode the version change type to 'patch' but it may be a good idea to
	// use minimist (https://www.npmjs.com/package/minimist) to determine with a
	// command argument whether you are doing a 'major', 'minor' or a 'patch' change.
	return gulp.src(['./bower.json', './package.json'])
				.pipe($.bump({type: "patch"}).on('error', gutil.log))
				.pipe(gulp.dest('./'));
});


gulp.task('commit-changes', function() {
	PKG = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
	return gulp.src('.')
				.pipe($.git.add())
				.pipe($.git.commit('['+ PKG.version +'] Bumped version number'));
});


gulp.task('push-changes', function(cb) {
	$.git.push('origin', 'master', cb);
});


gulp.task('create-new-tag', function(cb) {
	var version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;
	$.git.tag(version, 'Created Tag for version: '+ version, function(error) {
		if (error) return cb(error);
		$.git.push('origin', 'master', {args: '--tags'}, cb);
	});
});


gulp.task('commit', function(callback) {
	runSequence('minify', 'bump-version', 'changelog', 'commit-changes',
		function(error) {
			if (error) console.log(error.message);
			else console.log('COMMIT FINISHED SUCCESSFULLY');
			callback(error);
		});
});


gulp.task('release', function(callback) {
	runSequence('minify', 'bump-version', 'changelog', 'commit-changes', 'push-changes', 'create-new-tag', 'github-release',
		function(error) {
			if (error) console.log(error.message);
			else console.log('RELEASE FINISHED SUCCESSFULLY');
			callback(error);
		});
});
