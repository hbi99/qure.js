
var XMLHttpRequest = require('../src/xhr.js');

var xhr = new XMLHttpRequest();
var url = 'http://sandbox/node-response/get.php';
var postData = {
	'msg' : 'Hello World!'
};

xhr.open('GET', url, true);

//Send the proper header information along with the request
// xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
// xhr.setRequestHeader('Content-length', JSON.stringify(postData).length);
// xhr.setRequestHeader('Connection', 'close');

xhr.onreadystatechange = function() {
	//Call a function when the state changes.
    if(xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr.responseText);
    }
}
xhr.send(postData);
