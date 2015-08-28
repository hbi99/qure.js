# nowjs
Tiny javascript library, enabling codeflow like this

```js
now
	.wait(1000).then(function() {
		// executed after 1000 milliseconds
		console.log(1);
	})
	.wait(500).then(function() {
		// executed after 500 milliseconds after previous call
		console.log(2);
	})

```

