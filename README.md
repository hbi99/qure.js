# NowJS
Tiny javascript library, enabling codeflow like this

```js
Now
	.wait(1000).then(function() {
		// executed after 1000 milliseconds
		console.log(1);
	})
	.wait(500).then(function() {
		// executed after 500 milliseconds after previous call
		console.log(2);
	})

```

It is also possible to "fork" Now-timeline...which enables multiple queueing/chaining, independent of each other.

```js
Now.wait(200).then(function() {
		// executed after 200 milliseconds
		console.log(1);
	});

Now.fork().wait(250).then(function() {
		// executed after 250 milliseconds (50 ms after previous call)
		console.log(2);
	})

```

### To-do's
- [ ] Queue splice
- [ ] Hash ajax
- [ ] Recursion
- [ ] Node support



### Changelog
- [x] `0.1.4` 'this' is consistent & preserved throughout the chain
- [x] `0.1.3` Added support for queueable 'ajax' calls
- [x] `0.1.2` Added support for 'fork' of Now timeline
- [x] `0.1.1` First version, supporting 'wait' & 'then'
