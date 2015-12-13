
var http = require('http');
var querystring = require('querystring');
//console.log(querystring);

var postData = querystring.stringify({
	'msg' : 'Hello World!'
});

var options = {
	hostname: 'sandbox',
	port: 80,
	path: '/node-response/post.php',
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': postData.length
	}
};

var req = http.request(options, function(res) {
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	});
});

req.on('error', function(e) {
	console.log('problem with request: ' + e.message);
});

// write data to request body
req.write(postData);
req.end();
