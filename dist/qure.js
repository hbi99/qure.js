/* 
 * QureJS v0.2.1 
 * Tiny library introducing an easy design pattern. 
 * https://github.com/hbi99/QureJS.js 
 * 
 * Copyright (c) 2013-2015, Hakan Bilgin <hbi@longscript.com> 
 * Licensed under the MIT License 
 */ 

(function(window, module) {
	'use strict';

	// environment variables
	var isNode = !!module.id;

	// recursive requirements
	var recursion = {
			_globals: {
				require : isNode ? require : false,
				module  : isNode ? module  : false
			}
		};

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
					if (recursion._globals.res) {
						args.push(recursion._globals.res);
						delete recursion._globals.res;
					} else {
						args = arguments;
					}
					fn.apply(self.queue._that, args);
				};
			this.queue.push(func);
			return this;
		},
		load: function(url, hash, key) {
			var self = this,
				fn = function() {
					var cors = new CORSreq(self, url, hash, key);
					cors.send();
				};
			if (typeof(url) === 'object') {
				for (var name in url) {
					this.load(url[name], url, name);
				}
				return this;
			} else if (!hash) {
				this.load({_single: url});
				return this;
			}
			fn._paused = true;
			this.queue.push(fn);
			return this;
		},
		declare: function(record) {
			var func = function() {
					var str,
						args,
						body;
					for (var fn in record) {
						if (typeof record[fn] !== 'function') {
							recursion[fn] = record[fn];
							continue;
						}
						str  = record[fn].toString();
						args = str.match(/functio.+?\((.*?)\)/)[1].split(',');
						body = str.match(/functio.+?\{([\s\S]*)\}/i)[1].trim();
						// modify function body
						body = body.replace(/\bself\b/g,    'this._fn_'+ fn);
						body = body.replace(/\brequire\b/g, 'this._globals.require');
						body = body.replace(/\bmodule\b/g,  'this._globals.module');
						// append function body
						args.push(body);
						// prepeare recursion
						recursion['_fn_'+ fn] = Function.apply({}, args);
					}
				};
			this.queue.push(func);
			return this;
		},
		run: function() {
			var self = this,
				args = [].slice.apply(arguments),
				fn = function() {
					recursion._globals.res = recursion['_fn_'+ args.shift()].apply(recursion, args);
				};
			this.queue.push(fn);
			return this;
		},
		precede: function(fn) {
			this.queue.unshift(fn);
			return this;
		},
		play: function() {
			this.queue._paused = false;
			this.queue.flush();
			return this;
		},
		pause: function() {
			var fn = function() {

				};
			fn._paused = true;
			this.queue.push(fn);
			return this;
		}
	};

	// Export
	window.Qure = module.exports = new Qure();

})(
	typeof window !== 'undefined' ? window : {},
	typeof module !== 'undefined' ? module : {}
);
