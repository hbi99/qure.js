
var test = function() {
	
};

test.prototype = {
	// fibonacci numbers
	fibonacci: function(n) {
		return (n < 2) ? 1 : self(n-2) + self(n-1);
	}
};

module.exports = new test();
