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
- [ ] Add 'settings' method - debug purpose
- [ ] Add 'begin' method ?
- [ ] Load-method in Node environment
- [ ] Metaphorical support for Confirm & Prompt ?
- [ ] Wait for 'Qure' instance


### Testing
- [x] Threaded recursion (web worker)
- [x] Precede queue
- [x] Play/pause support
- [x] Node support


### Changelog
- [x] `0.2.3` 'this' in recursive functions
- [x] `0.2.2` First version of thread support
- [x] `0.2.1` Advanced 'declare' + 'run' method
- [x] `0.2.0` Published library as NPM module
- [x] `0.1.9` Renamed the library to QureJS
- [x] `0.1.8` Added test suite
- [x] `0.1.7` Fixed bug handling ajax loading
- [x] `0.1.6` Added support for recursion
- [x] `0.1.5` Added support for hashed ajax loading
- [x] `0.1.4` 'this' is consistent & preserved throughout the chain
- [x] `0.1.3` Added support for queueable 'ajax' calls
- [x] `0.1.2` Added support for 'fork' of Now timeline
- [x] `0.1.1` First version, supporting 'wait' & 'then'
