
console.log('External javascript loaded #2');

var test = function() {
	console.log(this);
};

test.prototype = {
	foo: function() {
		return 'bar';
	}
};

module.exports = new test();
