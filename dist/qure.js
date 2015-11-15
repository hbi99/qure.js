/*
 * qure.js [v0.2.11]
 * https://github.com/hbi99/QureJS.js 
 * Copyright (c) 2013-2015, Hakan Bilgin <hbi@longscript.com> 
 * Licensed under the MIT License
 */

(function(window, module) {
	'use strict';

	// environment variables
	var isNode = !!module.id;

	// recursive requirements
	var syncFunc = {
			_globals: {
				require : isNode ? require : false,
				module  : isNode ? module  : false
			}
		};

	var workFunc = {};

	// queuing mechanism
	function Queue(owner, that) {
		this._methods = [];
		this._owner = owner;
		this._that = that;
		this._paused = false;
	}
	Queue.prototype = {
		push: function(fn) {
			this._methods.push(fn);
			if (!this._paused) this.flush();
		},
		unshift: function(fn) {
			this._methods.unshift(fn);
			if (!this._paused) this.flush();
		},
		flush: function() {
			var fn,
				args = arguments;
			if (this._paused) return;
			while (this._methods[0]) {
				fn = this._methods.shift();
				fn.apply(this._that, args);
				if (fn._paused) {
					this._paused = true;
					break;
				}
			}
		}
	};

	// thread enabler
	var x10 = {
		setup: function(tree) {
			var url    = window.URL || window.webkitURL,
				script = 'var tree = {'+ this.parse(tree).join(',') +'};',
				blob,
				worker,
				work_handler;
			
			if (isNode) {
				// worker com handler
				work_handler = function(event) {
					var data = JSON.parse(event).data,
						func = data.shift(),
						res  = tree[func].apply(tree, data);
					// return process finish
					process.send(JSON.stringify([func, res]));
				};
				// create the worker
				worker = worker = new NodeWorker();
				// prepare script for the worker
				script = script +'process.on("message", '+ work_handler.toString() +');';
				// send function record to worker
				worker.postMessage(script);
			} else {
				// worker com handler
				work_handler = function(event) {
					var args = Array.prototype.slice.call(event.data, 1),
						func = event.data[0],
						ret  = tree[func].apply(tree, args);
					// send back results
					postMessage([func, ret]);
				};
				// script blob for the worker
				blob = new Blob([script +'self.addEventListener("message", '+ work_handler.toString() +', false);'], {type: 'text/javascript'});
				// create the worker
				worker = new Worker(url.createObjectURL(blob));
			}

			// thread pipe
			worker.onmessage = function(event) {
				var args = Array.prototype.slice.call(event.data, 1),
					func = event.data[0];
				this.qure.resume.apply(this.qure, args);
			};

			return worker;
		},
		call_handler: function(func, worker, qure) {
			return function() {
				var args = Array.prototype.slice.call(arguments);

				// add method name
				args.unshift(func);

				// pause qure instance
				qure.pause(true);

				// remeber qure instance
				worker.qure = qure;

				// start worker
				worker.postMessage(args);
			};
		},
		compile: function(record, qure) {
			var worker = this.setup(record),
				fn;
			// create return object
			for (fn in record) {
				workFunc[fn] = this.call_handler(fn, worker, qure);
			}
			// save reference
			workFunc._worker = worker;
		},
		parse: function(tree, isArray) {
			var hash = [],
				key,
				val,
				prop;

			for (key in tree) {
				prop = tree[key];
				// handle null
				if (prop === null) {
					hash.push(key +':null');
					continue;
				}
				// handle undefined
				if (prop === undefined) {
					hash.push(key +':undefined');
					continue;
				}
				switch (prop.constructor) {
					case Date:   val = 'new Date('+ prop.valueOf() +')';           break;
					case Object: val = '{'+ this.parse(prop).join(',') +'}';       break;
					case Array:  val = '['+ this.parse(prop, true).join(',') +']'; break;
					case String: val = '"'+ prop.replace(/"/g, '\\"') +'"';        break;
					case RegExp:
						val = prop.toString();
						val = 'new RegExp("'+ val.slice(1, val.lastIndexOf('/')) +'", "'+ val.slice(val.lastIndexOf('/')+1) +'")';
						break;
					case Function: val = prop.toString().replace(/\bself\b/g, 'this.'+ key); break;
					default: val = prop;
				}
				if (isArray) hash.push(val);
				else hash.push(key +':'+ val);
			}
			return hash;
		},
		parseFunc: function(name, func) {
			var str = func.toString(),
				args,
				body;
			args = str.match(/functio.+?\((.*?)\)/)[1].split(',');
			body = str.match(/functio.+?\{([\s\S]*)\}/i)[1].trim();
			// modify function body
			body = body.replace(/\bself\b/g,    'this.'+ name);
			body = body.replace(/\brequire\b/g, 'this._globals.require');
			body = body.replace(/\bmodule\b/g,  'this._globals.module');
			// shortcut to qure functions
			body = body.replace(/\bthis.pause\b/g,   'this._globals.qure.pause');
			body = body.replace(/\bthis.precede\b/g, 'this._globals.qure.precede');
			body = body.replace(/\bthis.then\b/g,    'this._globals.qure.then');
			body = body.replace(/\bthis.resume\b/g,  'this._globals.qure.resume');
			// run, fork, require, declare, wait
			//console.log( body );

			// append function body
			args.push(body);
			// return parse function body
			return Function.apply({}, args);
		}
	};

	// cors request
	function CORSreq(owner, url, hash, key) {
		var method = 'GET',
			xhr = new XMLHttpRequest();
		if ('withCredentials' in xhr) {
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest != 'undefined') {
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			// no-support -> fallback: JSReq ?
			throw 'XHR not supported';
		}
		xhr.hash   = hash;
		xhr.key    = key;
		xhr.owner  = owner;
		xhr.onload = this.doload;
		return xhr;
	}
	CORSreq.prototype = {
		doload: function(event) {
			var resp = JSON.parse(event.target.responseText),
				args = [],
				isDone = true,
				name;
			if (this.hash) {
				this.hash[this.key] = resp;

				for (name in this.hash) {
					if (typeof(this.hash[name]) === 'string') isDone = false;
				}
				if (isDone) {
					args.push(this.hash._single ? this.hash._single : this.hash);
				}
			}
			this.owner.queue._paused = false;
			this.owner.queue.flush.apply(this.owner.queue, args);
		}
	};

	// QureJS class
	function Qure() {
		var that = {};
		this.queue = new Queue(this, that);

		return this;
	}
	Qure.prototype = {
		fork: function() {
			return new Qure();
		},
		wait: function(duration) {
			var self = this,
				fn = function() {
					setTimeout(function() {
						self.queue._paused = false;
						self.queue.flush();
					}, duration || 0);
				};
			fn._paused = true;
			this.queue.push(fn);
			return this;
		},
		then: function(fn) {
			var self = this,
				func = function() {
					var args = [];
					if (syncFunc._globals.res) {
						args.push(syncFunc._globals.res);
						delete syncFunc._globals.res;
					} else {
						args = arguments;
					}
					fn.apply(self.queue._that, args);
					// kill child process, if queue is done and cp exists
					if (!self.queue._methods.length) {
						workFunc._worker.process.kill();
					}
				};
			this.queue.push(func);
			return this;
		},
		require: function(url, hash, key) {
			var self = this,
				fn = function() {
					var cors = new CORSreq(self, url, hash, key);
					cors.send();
				};
			if (typeof(url) === 'object') {
				for (var name in url) {
					this.require(url[name], url, name);
				}
				return this;
			} else if (!hash) {
				this.require({_single: url});
				return this;
			}
			fn._paused = true;
			this.queue.push(fn);
			return this;
		},
		declare: function(record) {
			var self = this,
				func = function() {
					var tRecord = {},
						key,
						prop;
					if (typeof(record) === 'function') {
						record = {
							single_anonymous_func: record
						};
					}
					for (key in record) {
						prop = record[key];
						if (prop.constructor !== Function) {
							syncFunc[key] =
							tRecord[key] = record[key];
							continue;
						}
						if (key.slice(-4) === 'Sync') {
							syncFunc[key] = x10.parseFunc(key, record[key]);
						} else {
							tRecord[key] = record[key];
						}
					}
					// compile threaded functions
					x10.compile(tRecord, self);
				};
			this.queue.push(func);
			return this;
		},
		run: function() {
			var self = this,
				args = Array.prototype.slice.call(arguments),
				fn = function() {
					var name = (workFunc[args[0]] || syncFunc[args[0]]) ? args.shift() : 'single_anonymous_func';

					if (syncFunc[name]) {
						// this is a sync call
						syncFunc._globals.qure = self;
						syncFunc._globals.res = syncFunc[name].apply(syncFunc, args);
					} else {
						// pause queue execution
						self.pause(true);
						// call threaded function
						workFunc[name].apply(workFunc, args);
					}
				};
			this.queue.push(fn);
			return this;
		},
		precede: function(fn) {
			this.queue.unshift(fn);
			return this;
		},
		resume: function() {
			this.queue._paused = false;
			this.queue.flush.apply(this.queue, arguments);
			return this;
		},
		pause: function(precede) {
			var fn = function() {};
			fn._paused = true;
			if (precede) this.queue.unshift(fn);
			else this.queue.push(fn);
			return this;
		}
	};


	if (isNode) {
		// worker class for node environment
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
		}

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
	}

	// Export
	window.Qure = module.exports = new Qure();

})(
	typeof window !== 'undefined' ? window : {},
	typeof module !== 'undefined' ? module : {}
);
