
process.once('message', function (code) {
	eval(JSON.parse(code).data); // jshint ignore:line
});
