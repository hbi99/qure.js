
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
	var seqFunc = {};

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
			if (!this._paused && !fn._paused) this.flush();
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
				worker = worker = new window.Worker();
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
				worker = new window.Worker(url.createObjectURL(blob));
			}

			// thread pipe
			worker.onmessage = function(event) {
				var args = Array.prototype.slice.call(event.data, 1),
					func = event.data[0];
				if (['pause', 'resume', 'precede'].indexOf(func) === -1) {
					func = 'resume';
				}
				this.qure[func].apply(this.qure, args);
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
					case Function: val = prop.toString().replace(/^(?!var)\bself\b/g, 'this.'+ key); break;
					default: val = prop;
				}
				if (isArray) hash.push(val);
				else hash.push(key +':'+ val);
			}
			if (isNode) {
				hash.push("pause   : function() { process.send(JSON.stringify(['pause'].concat(Array.prototype.slice.call(arguments)))); }");
				hash.push("resume  : function() { process.send(JSON.stringify(['resume'].concat(Array.prototype.slice.call(arguments)))); }");
				hash.push("precede : function() { process.send(JSON.stringify(['precede'].concat(Array.prototype.slice.call(arguments)))); }");
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
			body = body.replace(/^(?!var)\bself\b/g, 'this.'+ name);
			body = body.replace(/\brequire\b/g,      'this._globals.require');
			body = body.replace(/\bmodule\b/g,       'this._globals.module');
			// shortcut to qure functions
			body = body.replace(/\.pause\(/g,        '._globals.qure.pause(');
			body = body.replace(/\.resume\(/g,       '._globals.qure.resume(');
			body = body.replace(/\.precede\(/g,      '._globals.qure.precede(');
			//body = body.replace(/\.then\(/g,    '._globals.qure.then(');
			// run, fork, require, declare, wait
			//console.log( body );

			// append function body
			args.push(body);
			// return parse function body
			return Function.apply({}, args);
		}
	};

	// cors request
	function CORSreq(owner, opt, hash, key) {
		var xhr = new window.XMLHttpRequest(),
			method = opt.method || 'GET',
			url = opt.url,
			params,
			name;

		xhr.onreadystatechange = this.readystatechange;
		xhr.autoParse = this.autoParse;
		xhr.hash  = hash;
		xhr.key   = key;
		xhr.url   = url;
		xhr.owner = owner;

		if (opt.data) {
			params = param.parse(opt.data);
			// append params to url
			if (method === 'GET' && opt.data) {
				url += (url.indexOf('?') === -1)? '?' : '&';
				url += param.parse(opt.data);
			}
		}
		if ('withCredentials' in xhr) {
			// allways async request
			xhr.open(method, url, true);
		}
		if (opt.headers) {
			for (name in opt.headers) {
				xhr.setRequestHeader(name, opt.headers[name]);
			}
		} else {
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}
		xhr.send(params);
	}
	CORSreq.prototype = {
		readystatechange: function(event) {
			var req  = event.target,
				aHash = {},
				args = [],
				isDone = true,
				name,
				parsed,
				oRet;
			if (req.status !== 200 || req.readyState !== 4) return;
			// try the autoparser
			parsed = this.autoParse(this.url, req);
			// prepare return object
			oRet = {
				responseText : parsed.responseText,
				status       : req.status
			};
			if (parsed.responseJSON) oRet.responseJSON = parsed.responseJSON;
			if (parsed.responseXML) oRet.responseXML = parsed.responseXML;

			if (this.hash) {
				this.hash[this.key] = oRet;
				for (name in this.hash) {
					if (this.hash[name].status !== 200) {
						isDone = false;
					}
				}
				if (isDone) {
					for (name in this.hash) {
						aHash[name] = this.hash[name].responseJSON || this.hash[name].responseXML || this.hash[name].responseText;
					}
					if (!oRet.responseText) args.push(parsed);
					else args.push(this.hash._single ? this.hash._single.responseText : aHash);
				}
			} else {
				args.push(oRet);
			}
			this.owner.queue._paused = false;
			this.owner.queue.flush.apply(this.owner.queue, args);
		},
		autoParse: function(url, req) {
			var str       = req.responseText,
				isDeclare = url.slice(-8) === '?declare',
				ext       = url.split('.'),
				ctype     = req.headers || req.getResponseHeader ? req.getResponseHeader('Content-Type').match(/.+\/(\w+)?/)[1] : ext[ext.length-1],
				ret       = { responseText: str },
				type,
				parser;
			// extract extension
			ext = ext[ext.length-1];
			// trim ext if 'isDeclare'
			if (isDeclare) {
				ext = ext.slice(0,-8);
			} else if (url === ext) {
				ext = ctype;
			}
			// select available autoparser
			switch(ext) {
				case 'css':
					if (isNode) {
						ret = str;
					} else {
						ret = window.document.createElement('style');
						ret.innerHTML = str;
					}
					break;
				case 'js':
					if (isNode || isDeclare) {
						/* jshint ignore:start */
						eval('(function(window, module) {'+ str +'}).bind({})('+
								'	typeof window !== "undefined" ? window : {},'+
								'	typeof module !== "undefined" ? module : {}'+
								');');
						// transfer exports to return object and clear variable
						ret = module.exports;
						delete module.exports;
						/* jshint ignore:end */
					} else {
						ret = document.createElement('script');
						ret.type = "text/javascript";
						ret.appendChild(document.createTextNode(str));
					}
					break;
				case 'json':
					ret.responseJSON = JSON.parse(str);
					break;
				/* falls through */
				case 'htm':
				/* falls through */
				case 'html':
					type = 'text/html';
				/* falls through */
				case 'xml':
				case 'xsl':
					if (isNode) {
						ret = str;
					} else {
						parser = new DOMParser();
						ret.responseXML = parser.parseFromString(str, type || 'text/xml');
					}
					break;
				default:
			}
			return ret;
		}
	};

	// parameter parser
	var param = {
		parse: function(obj) {
			var self = this,
				prefix;
			// reset serialize
			this.serialize = [];

			if (obj.constructor === Array) {
				// Serialize the form elements
				obj.forEach(function(item, i) {
					self.add(i, item);
				});
			} else {
				// Encode params recursively.
				for (prefix in obj) {
					this.build(prefix, obj[prefix]);
				}
			}
			// Return the resulting serialization
			return this.serialize.join('&');
		},
		add: function(key, value) {
			// If value is a function, invoke it and return its value
			value = (value.constructor === Function)? value() : (value === null ? '' : value);
			this.serialize.push(encodeURIComponent( key ) +'='+ encodeURIComponent( value ));
		},
		build: function(prefix, obj) {
			var self = this,
				name;
			if (obj.constructor === Array) {
				// Serialize array item.
				obj.forEach(function(item, i) {
					// Item is non-scalar (array or object), encode its numeric index.
					self.build(prefix +'['+ (typeof item === 'object' && item !== null ? i : '') +']', item);
				});
			} else if (typeof(obj) === 'object') {
				// Serialize object item.
				for (name in obj) {
					this.build(prefix +"["+ name +"]", obj[ name ]);
				}
			} else {
				// Serialize scalar item.
				this.add(prefix, obj);
			}
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
					// kill child process, if queue is done and childprocess exists
					if (!self.queue._methods.length && workFunc._worker && workFunc._worker.process) {
						workFunc._worker.process.kill();
					}
				};
			this.queue.push(func);
			return this;
		},
		xhr: function(opt) {
			var self = this,
				fn = function() {
					new CORSreq(self, opt);
				};
			fn._paused = true;
			this.queue.push(fn);
			return this;
		},
		load: function(opt, hash, key) {
			var self = this,
				name,
				fn = function() {
					new CORSreq(self, opt, hash, key);
				};
			if (!hash && typeof(opt) === 'object') {
				for (name in opt) {
					this.load({url: opt[name]}, opt, name);
				}
				return this;
			} else if (!hash) {
				return this.load({_single: opt});
			}
			fn._paused = true;
			this.queue.push(fn);
			return this;
		},
		declare: function(record) {
			var self = this,
				func = function() {
					var tRecord = {},
						isWorkers = record.workers,
						key,
						prop;
					for (key in record) {
						prop = record[key];
						if (prop.constructor !== Function) {
							syncFunc[key] =
							tRecord[key] = record[key];
							continue;
						}
						if (isWorkers) {
							tRecord[key] = record[key];
						} else {
							syncFunc[key] = x10.parseFunc(key, record[key]);
						}
					}
					// compile threaded functions
					x10.compile(tRecord, self);
				};
			if (typeof(record) === 'string') {
				var fn = function(d) {
					self.precede(function() {
						record += '?declare';
						self.fork()
							.load(record)
							.then(function(d) {
								record = d;
								func(d);
								self.resume();
							});
					});
				};
				fn._paused = true;
				this.precede(fn);
			} else {
				this.queue.push(func);
			}
			return this;
		},
		run: function() {
			var self = this,
				args = Array.prototype.slice.call(arguments),
				fn = function() {
					var name = args.shift();
					if (syncFunc[name]) {
						// this is a sync call
						syncFunc._globals.qure = self;
						syncFunc._globals.res = syncFunc[name].apply(syncFunc, args);
					} else if (seqFunc[name]) {
						var that = seqFunc[name],
							methods = that.queue._methods.slice(0);
						that.resume(args);
						that.queue._methods = methods;
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
		},
		sequence: function(name, fn) {
			var that = this.fork(),
				func = function(args) {
					fn.apply(that.fork(), args);
				};
			// add queue
			that.queue._methods = [func];
			// save reference to sequence
			seqFunc[name] = that;
			return this;
		}
	};

	if (isNode) {
		// worker class for node environment
		window.Worker = require('./worker');
		window.XMLHttpRequest = require('./xhr');
	}

	// Export
	window.Qure = module.exports = new Qure();

})(
	typeof window !== 'undefined' ? window : {},
	typeof module !== 'undefined' ? module : {}
);
