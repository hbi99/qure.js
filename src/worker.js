
var NodeWorker = function() {
	var that = this,
		ps   = require('child_process');
	// fork child process
	this.process = ps.fork(__dirname +'/eval');

	// prepare out-bound com
	this.process.on('message', function (msg) {
		that.terminate();

		if (that.onmessage) {
			that.onmessage({ data: JSON.parse(msg) });
		}
	});
	
	// error handler (todo)
	this.process.on('error', function (err) {
		if (that.onerror) {
			that.onerror(err);
		}
	});
};

NodeWorker.prototype = {
	onmessage: null,
	onerror: null,
	postMessage: function (obj) {
		this.process.send(JSON.stringify({ data: obj }));
	},
	terminate: function () {
		//this.process.kill();
	}
};

module.exports = NodeWorker;