// Main application. Handles API calls from user and from greenboxes.
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var serveStatic = require('serve-static');


const express = require('express');
const parser = require('body-parser');
const app = express();

// seed users with an already-existing box
var users = {123: {"boxes":[
  {boxId:"b0001", type:"Lemon Tree"},
  {boxId:"b0002", type:"Orchid" }
],"gender":"male"}}; // userId: list of boxes (boxId, type)

// define a few boxes for the user
var predefinedBoxes = [
  {name:"Lemon Tree", maxYearly:70, minYearly:46, dailyDiff:10 },
  {name:"Orchid", maxYearly:88, minYearly:76, dailyDiff:5 }
];

var staticName = path.join(__dirname, "/../web-client/");
app.use(express.static(staticName));

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.get('/', (req, res) => res.send('Hello World!'))

// create a greenbox
app.post('/greenbox/:userId', function (req, res) {
  var userId = req.params.userId;

  if(users[userId]) {
    var usersBoxes = users[userId].boxes;
    if(usersBoxes) {

      for(var i = 0; i < usersBoxes.length; i++) {
        if(usersBoxes[i].boxId && req.body.boxId){

          // TODO: copy the rest of the value objects off of the request, too
          users[userId].boxes[i].type = req.body.type;
          users[userId].boxes[i].maxYearly = req.body.maxYearly;
          users[userId].boxes[i].minYearly = req.body.minYearly;
          users[userId].boxes[i].dailyDiff = req.body.dailyDiff;
          break;
        }
      }
    }
  }

  res.send('Greenbox created or updated for userId:' + userId)
})

// get a greenbox
app.get('/greenbox/:boxId', function (req, res) {
  var id = req.params.boxId;
  console.log('Attempting to get box with id '+id);

  res.send();
})

app.get('/boxes/predefined', function(req, res) {
  console.log('Attempting to get all predefined boxes');

  res.send(predefinedBoxes);
})

// create a user
app.post('/user', function (req, res) {
  res.send('User created or updated ' + req.body.id)
})

// get a user
app.get('/user/:userId', function (req, res) {
  var id = req.params.userId;
  console.log('Attempting to load user id ' + id);

  var ret = users[id];
  console.log('Found '+ret);
  res.send(ret);
})


app.listen(3000, () => console.log('Example app listening on port 3000!'))
