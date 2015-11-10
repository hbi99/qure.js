
var x10 = require('./x10-node');

var task = x10.compile({
		loop: function(len) {
			while (len--) {};
			return len;
		}
	});

//task.postMessage( 'fn(3)' );

task.loop(100, function(res) {
	console.log( res );
});

