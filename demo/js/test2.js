
console.log('External javascript loaded #2');

var test = function() {
	
};

test.prototype = {
	// declare type (omitted or false = not threaded)
	workers: true,
	// fibonacci numbers
	fibonacci: function(n) {
		return (n < 2) ? 1 : self(n-2) + self(n-1);
	},
	foo: function() {
		return 'bar';
	}
};

module.exports = new test();
