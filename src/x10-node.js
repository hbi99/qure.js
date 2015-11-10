
'use strict';

(function(window, module) {

	var workFunc = {};

	// x10 class
	var x10 = {
		work_handler: function(e) {
			var data = JSON.parse(e).data,
				func = data.shift(),
				res  = tree[func].apply(tree, data);
			// send back results
			process.send(JSON.stringify([func, res]));
		},
		setup: function(tree) {
			var worker  = new Worker(),
				src = 'var tree = {'+ this.parse(tree).join(',') +'};'+
						'process.on("message", '+ this.work_handler.toString() +');';

			worker.onmessage = function(event) {
				var args = Array.prototype.slice.call(event.data, 1),
					func = event.data[0];
				x10.observer.emit('x10:'+ func, args);
			};

			// send function record to worker
			worker.postMessage(src);

			return worker;
		},
		call_handler: function(func, worker) {
			return function() {
				var args = Array.prototype.slice.call(arguments, 0, -1),
					callback = arguments[arguments.length-1];

				// add method name
				args.unshift(func);

				// listen for 'done'
				x10.observer.on('x10:'+ func, function(event) {
					callback(event.detail[0]);
				});

				// start worker
				worker.postMessage(args);
			};
		},
		compile: function(record) {
			var worker = this.setup(record),
				fn;

			// loop record and attach handler
			for (fn in record) {
				workFunc[fn] = this.call_handler(fn, worker);
			}

			return workFunc;
		},
		parse: function(tree) {
			var hash = [],
				key;
			for (key in tree) {
				hash.push(key +':'+ tree[key].toString());
			}
			return hash;
		},
		// simple event emitter
		observer: (function() {
			var stack = {};

			return {
				on: function(type, fn) {
					if (!stack[type]) {
						stack[type] = [];
					}
					stack[type].unshift(fn);
				},
				off: function(type, fn) {
					if (!stack[type]) return;
					var i = stack[type].indexOf(fn);
					stack[type].splice(i,1);
				},
				emit: function(type, detail) {
					if (!stack[type]) return;
					var event = {
							type         : type,
							detail       : detail,
							isCanceled   : false,
							cancelBubble : function() {
								this.isCanceled = true;
							}
						},
						len = stack[type].length;
					while(len--) {
						if (event.isCanceled) return;
						stack[type][len](event);
					}
				}
			};
		})()
	};

	// worker class
	function Worker() {
		var that = this,
			ps   = require('child_process');
		// fork child process
		this.process = ps.fork(__dirname +'/eval');

		// prepare out-bound com
		this.process.on('message', function (msg) {
			that.terminate();
			
			//console.log( msg );
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
	}

	Worker.prototype = {
		onmessage: null,
		onerror: null,
		postMessage: function (obj) {
			this.process.send(JSON.stringify({ data: obj }));
		},
		terminate: function () {
			this.process.kill();
		}
	};

	// Export
	window.x10 = module.exports = x10;

})(
	typeof window !== 'undefined' ? window : {},
	typeof module !== 'undefined' ? module : {}
);
