# QureJS
Tiny javascript library, enabling codeflow like this

```js
Qure
    .wait(1000)
    .then(function() {
        // executed after 1000 milliseconds
        console.log(1);
    })
    .wait(500)
    .then(function() {
        // executed after 500 milliseconds after previous call
        console.log(2);
    })

```

It is also possible to "fork" the timeline...which enables multiple queueing/chaining, independent of each other.

```js
Qure
    .wait(200)
    .then(function() {
        // executed after 200 milliseconds
        console.log(1);
    });

Qure
    .fork()
    .wait(250).then(function() {
        // executed after 250 milliseconds (50 ms after previous call)
        console.log(2);
    })

```

### To-do's
- [ ] Templating example
- [ ] Example connect to DefiantJS
- [ ] Declare 'sequence' ?
- [ ] Add 'settings' method - debug purpose
- [ ] Add 'watch' method ?
- [ ] Add 'begin' method ?
- [ ] Metaphorical support for Confirm & Prompt ?
- [ ] Wait for 'Qure' instance
- [ ] Save sequence for replay ?
- [ ] Support CRUD requests
- [ ] built-in support for rest-API ?


### Testing
- [x] Handle response handlers better (node XHR)
- [x] Load-method & XDomainRequest in Node environment
- [x] autoparse xhr response

