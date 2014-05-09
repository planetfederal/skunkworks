var path = require('path');
var http = require('http');
var proxy = require('http-proxy').createProxy();
var connect = require('connect');

console.log(path.resolve(__dirname, 'client'));

connect.createServer(
  connect.favicon(),
  connect.static(path.resolve(__dirname, 'client'))
).listen(8081);

http.createServer(function(req, res) {
  req.on('error', function(err) {
    console.log(err);
  });
  if (req.url.indexOf('/gs') === 0) {
    req.url = req.url.slice(3);
    console.log(req.url);
    proxy.web(req, res, {
      target: 'http://ec2-75-101-218-208.compute-1.amazonaws.com:8080'
    });
  } else {
    proxy.web(req, res, {
      target: 'http://localhost:8081'
    });
  }

}).listen(8000);

proxy.on('error', function(err) { });

console.log('Server started on port 8000');
