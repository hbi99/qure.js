
var Qure = require('./qure');

Qure
	.declare({
		// fibonacci numbers
		fibonacci: function(n) {
			return (n < 2) ? 1 : this.fibonacci(n-2) + this.fibonacci(n-1);
		},
		// factorial numbers
		factorial: function(n) {
			return (n <= 0) ? 1 : (n * this.factorial(n - 1));
		}
	})
	.run('fibonacci', 7)
	.then(function(res) {
		console.log(res);
	});
