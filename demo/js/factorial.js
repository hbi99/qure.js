
var test = function() {
	
};

test.prototype = {
	// factorial numbers
	factorial: function(n) {
		return (n < 2) ? 1 : self(n-2) + self(n-1);
	}
};

module.exports = new test();
