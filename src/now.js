
(function(window, document, undefined) {
	'use strict';

	// queuing mechanism
	function Queue(owner) {
		this._methods = [];
		this._owner = owner;
		this._paused = false;
	}
	Queue.prototype = {
		add: function(fn) {
			this._methods.push(fn);
			if (!this._paused) this.flush();
		},
		flush: function() {
			if (this._paused) return;
			while (this._methods[0]) {
				var fn = this._methods.shift();
				fn.call(this._owner);
				if (fn._paused) {
					this._paused = true;
					break;
				}
			}
		}
	};

	// nowjs class
	var now = function() {
		var that = {};
		now.extendClass(that);
		that.queue = new Queue(that);
		return that;
	};
	now.extendClass = function(that) {
		for (var method in now.prototype) {
			if (now.prototype.hasOwnProperty(method)) {
				that[method] = now.prototype[method];
			}
		}
		return that;
	};
	now.prototype = {
		wait: function(duration) {
			var self = this,
				fn = function() {
					setTimeout(function() {
						self.queue._paused = false;
						self.queue.flush();
					}, duration);
				};
			fn._paused = true;
			this.queue.add(fn);
			return this;
		},
		then: function(fn) {
			if (fn) this.queue.add(fn);
			return this;
		}
	};

	window.now = now();

})(window, document);