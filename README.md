# QureJS
Tiny javascript library, enabling codeflow like this

```js
Qure
	.wait(1000).then(function() {
		// executed after 1000 milliseconds
		console.log(1);
	})
	.wait(500).then(function() {
		// executed after 500 milliseconds after previous call
		console.log(2);
	})

```

It is also possible to "fork" the timeline...which enables multiple queueing/chaining, independent of each other.

```js
Qure.wait(200).then(function() {
		// executed after 200 milliseconds
		console.log(1);
	});

Qure.fork().wait(250).then(function() {
		// executed after 250 milliseconds (50 ms after previous call)
		console.log(2);
	})

```

### To-do's
- [ ] Load-method in Node environment
- [ ] Declare method?
- [ ] Queue splice
- [ ] Threaded recursion (web worker)
- [ ] Node support
- [ ] Metaphorical support for Confirm & Prompt?
- [ ] Wait for 'Now' instance



### Changelog
- [x] `0.1.9` Renamed the library to QureJS
- [x] `0.1.8` Added test suite
- [x] `0.1.7` Fixed bug handling ajax loading
- [x] `0.1.6` Added support for recursion
- [x] `0.1.5` Added support for hashed ajax loading
- [x] `0.1.4` 'this' is consistent & preserved throughout the chain
- [x] `0.1.3` Added support for queueable 'ajax' calls
- [x] `0.1.2` Added support for 'fork' of Now timeline
- [x] `0.1.1` First version, supporting 'wait' & 'then'
