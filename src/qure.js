
(function(window, module) {
	'use strict';

	// queuing mechanism
	function Queue(owner, that) {
		this._methods = [];
		this._owner = owner;
		this._that = that;
		this._paused = false;
	}
	Queue.prototype = {
		add: function(fn) {
			this._methods.push(fn);
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

	// recursive requirements
	var recursion = {};

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
			this.queue.add(fn);
			return this;
		},
		then: function(fn) {
			var self = this,
				func = function() {
					var args = [];
					if (recursion.res) {
						args.push(recursion.res);
						delete recursion.res;
					} else {
						args = arguments;
					}
					fn.apply(self.queue._that, args);
				};
			this.queue.add(func);
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
			this.queue.add(fn);
			return this;
		},
		declare: function(fn) {
			var func = function() {
					var str  = fn.toString(),
						args = str.match(/functio.+?\((.*?)\)/)[1].split(','),
						body = str.match(/functio.+?\{([\s\S]*)\}/i)[1].trim();

					body = body.replace(/\bself\(/g, 'this.fn(');

					// append function body
					args.push(body);

					// prepeare recursion
					recursion.fn = Function.apply({}, args);
				};
			this.queue.add(func);
			return this;
		},
		run: function() {
			var self = this,
				args = arguments,
				fn = function() {
					recursion.res = recursion.fn.apply(recursion, args);
				};
			this.queue.add(fn);
			return this;
		},
		play: function() {
			return this;
		},
		pause: function() {
			var fn = function() {

				};
			fn._paused = true;
			this.queue.add(fn);
			return this;
		}
	};

	// Export
	window.Qure = module.exports = new Qure();

})(
	typeof window !== 'undefined' ? window : {},
	typeof module !== 'undefined' ? module : {}
);
