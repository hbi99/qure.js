
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

	// observer mechanism
	var observer = function() {
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
	};

	// thread enabler
	var x10 = {
		init: function() {
			return this;
		},
		work_handler: function(event) {
			var args = Array.prototype.slice.call(event.data, 1),
				func = event.data[0],
				ret  = tree[func].apply(tree, args);

			// return process finish
			postMessage([func, ret]);
		},
		setup: function(tree) {
			var url    = window.URL || window.webkitURL,
				script = 'var tree = {'+ this.parse(tree).join(',') +'};',
				blob   = new Blob([script +'self.addEventListener("message", '+ this.work_handler.toString() +', false);'],
									{type: 'text/javascript'}),
				worker = new Worker(url.createObjectURL(blob));
			
			// thread pipe
			worker.onmessage = function(event) {
				var args = Array.prototype.slice.call(event.data, 1),
					func = event.data[0];
				x10.observer.emit('thread:'+ func, args);
			};

			return worker;
		},
		call_handler: function(func, worker, callback) {
			return function() {
				var args = [].slice.call(arguments),
					fn = function(event) {
						x10.observer.off('thread:'+ func, fn);
						callback(event.detail[0]);
					};

				// add method name
				args.unshift(func);

				// listen for 'done'
				x10.observer.on('thread:'+ func, fn);

				// start worker
				worker.postMessage(args);
			};
		},
		compile: function(record, callback) {
			var worker = this.setup(record),
				fn;
			// create return object
			for (fn in record) {
				workFunc[fn] = this.call_handler(fn, worker, callback);
			}
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
					case Function:
						val = prop.toString();
						val = val.replace(/\bself\b/g, 'this.'+ key);
						break;
					default:
						val = prop;
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
		},
		// simple event emitter
		observer: observer()
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
							continue;
						}
						if (key.slice(-4) === 'Sync') {
							syncFunc[key] = x10.parseFunc(key, record[key]);
						} else {
							tRecord[key] = record[key];
						}
					}
					// compile threaded functions
					x10.compile(tRecord, function() {
						self.precede(function() {
							// pause queue execution
							self.pause();
						});
						self.resume.apply(self, arguments);
					});
				};
			this.queue.push(func);
			return this;
		},
		run: function() {
			var self = this,
				args = [].slice.apply(arguments),
				fn = function() {
					var name = (workFunc[args[0]]) ? args.shift() : 'single_anonymous_func';

					if (syncFunc[name]) {
						// this is a sync call
						syncFunc._globals.qure = self;
						syncFunc._globals.res = syncFunc[name].apply(syncFunc, args);
					} else {
						// pause queue execution
						self.pause();
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
		pause: function(fn) {
			fn = fn || function() {};
			fn._paused = true;
			this.queue.unshift(fn);
			return this;
		}
	};

	// Export
	window.Qure = module.exports = new Qure();

})(
	typeof window !== 'undefined' ? window : {},
	typeof module !== 'undefined' ? module : {}
);
