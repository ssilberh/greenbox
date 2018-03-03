// Main application. Handles API calls from user and from greenboxes.
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var serveStatic = require('serve-static');


const express = require('express');
const parser = require('body-parser');
const app = express();

var greenboxes = {};

// http.createServer(function(request, response) {
//   var staticName = path.join(__dirname, "/../web-client/");
//
//   console.log("trying to host:"+staticName)
//   app.use(express.static(staticName));
//
//   var uri = url.parse(request.url).pathname
//     , filename = path.join(process.cwd(), uri);
// console.log("request with filename:"+filename)
// console.log("request with uri"+uri)
//   fs.exists(filename, function(exists) {
//     if(!exists) {
//       response.writeHead(404, {"Content-Type": "text/plain"});
//       response.write("404 Not Found\n");
//       response.end();
//       return;
//     }
//
//     if (fs.statSync(filename).isDirectory()) filename += '../web-client/index.html';
//
//
//     //app.use("web-client",express.static(staticName));
//
//     fs.readFile(filename, "binary", function(err, file) {
//       if(err) {
//         response.writeHead(500, {"Content-Type": "text/plain"});
//         response.write(err + "\n");
//         response.end();
//         return;
//       }
//
//       response.writeHead(200);
//       response.write(file, "binary");
//       response.end();
//     });
//   });
// }).listen(9999, () => console.log('Webpage on port 9999!'));

var staticName = path.join(__dirname, "/../web-client/");

console.log("trying to host:"+staticName)
app.use(express.static(staticName));

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.get('/', (req, res) => res.send('Hello World!'))

// create a greenbox
app.post('/greenbox', function (req, res) {
  var id = req.body.id;
  console.log('Attempting to add box '+id);

  greenboxes.id = req.body;
  res.send('Greenbox created or updated ' + id)
})

// get a greenbox
app.get('/greenbox/:boxId', function (req, res) {
  var id = req.params.boxId;
  console.log('Attempting to get box with id '+id);

  var requestedGreenbox = greenboxes.id;
  res.send('Got Greenbox: ' + JSON.stringify(requestedGreenbox));
})

// create a user
app.post('/user', function (req, res) {
  res.send('User created or updated ' + req.body.id)
})

// get a user
app.get('/user', function (req, res) {
  res.send('User created or updated ' + req.body.id)
})


app.listen(3000, () => console.log('Example app listening on port 3000!'))
