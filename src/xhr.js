
var HTTP = require('http'),
	URL  = require('url'),
	querystring = require('querystring'),
	request,
	settings,
	postData;

var XMLHttpRequest = function() {
	'use strict';
};

XMLHttpRequest.prototype = {
	// current state
	readyState   : 0,
	// result & response
	responseType : '',
	responseURL  : '',
	responseText : '',
	responseXML  : null,
	status       : 0,
	statusText   : '',
	//timeout: 0,
	//onloadend: null,
	//ontimeout: null,
	withCredentials: false,
	// event handlers
	onreadystatechange: null,
	abort: function() {
		// set state to 'unsent'
		this.readyState   = 0;
		this.statusText   = '';
		this.responseType = '';
		this.responseURL  = '';
		this.responseText = '';
		this.responseXML  = null;
	},
	open: function(method, url, async, user, password) {
		this.abort();

		var urlInfo = URL.parse(url);

		settings = {
		//	async    : (typeof async !== 'boolean' ? true : async),
		//	user     : user || null,
		//	password : password || null
			port     : urlInfo.port || 80,
			hostname : urlInfo.host,
			path     : urlInfo.path,
			method   : method,
			headers  : {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		};
		// set state to 'opened'
		this.readyState = 1;
	},
	send: function(data) {
		var self = this,
			qStr = querystring.stringify(data);

		if (settings.method === 'GET') {
			settings.path += '?'+ qStr;
		}

		request = HTTP.request(settings, function(res) {
			// set state to 'headers_received'
			self.readyState = 2;
			// set response encoding
			res.setEncoding('utf8');
			// add listener
			res.on('data', function (str) {
				// set state to 'done'
				self.readyState = 4;
				self.status = 200;
				self.responseText = str;
				self.onreadystatechange();
			});
		});

		request.on('error', function(err) {
			// set state to 'done'
			self.readyState = 4;
			self.status = 0;
			self.statusText = err.stack;
			self.responseText = err.message;
			self.onreadystatechange();
		});

		// write data to request body
		request.write(qStr);
		request.end();
	},
	getRequestHeader: function(name) {
		return settings.headers[name];
	},
	setRequestHeader: function(name, value) {
		settings.headers[name] = value;
	}
};

module.exports = XMLHttpRequest;

