// Main application. Handles API calls from user and from greenboxes.
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var serveStatic = require('serve-static');


const express = require('express');
const parser = require('body-parser');
const app = express();

// types of boxes
const boxTypeEnum = Object.freeze(["Terrestrial", "Aquatic"])

// seed users with an already-existing box
// also, define a box that only this user can see - they created this (but populate
// it with fake data for now)
var users = { 123:
{
  "boxes":[
    {boxId:"b0001", name:"Lemon Tree"},
    {boxId:"b0002", name:"Orchid" }
  ],
  "gender":"male",
  "userDefinedBoxes":[
    {name:"Steven's Cool Plant", maxYearly:55, minYearly:36, dailyDiff:6, type:boxTypeEnum[1], userDefined:true }
  ]
}};

// define a few boxes for the user that come by default
var predefinedBoxes = [
  {name:"Lemon Tree", maxYearly:70, minYearly:46, dailyDiff:10, type:boxTypeEnum[0], userDefined:false },
  {name:"Orchid", maxYearly:88, minYearly:76, dailyDiff:5, type:boxTypeEnum[0], userDefined:false }
];

var staticName = path.join(__dirname, "/../web-client/");
app.use(express.static(staticName));

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.get('/', (req, res) => res.send('Hello World!'))

// Find if the type of the inputted box is already present in the predefinedBoxes
// or userDefinedBoxes. If it isn't, create a new type in the userDefinedBoxes.
var addOrUpdateBoxType = function(userId, box) {
console.log('trying to find '+box.name)
  // check if the box is in the predefined boxes list
  for(var i = 0; i < predefinedBoxes.length; i++) {
    if(predefinedBoxes[i].name == box.name) {
      console.log('found '+box.name+' in predefined')

      return;
    }
  }

  // TODO: if this doesn't exist, create it
  if(userId && users[userId] && users[userId].userDefinedBoxes) {
    // check if the box is in the user defined boxes list
    for(var i = 0; i < users[userId].userDefinedBoxes.length; i++) {
      if(users[userId].userDefinedBoxes[i].name == box.name) {
        console.log('found '+box.name+' in user defined boxes')

        return;
      }
    }
    console.log('havent found '+box.name+' so adding now')

    // if we've gotten here, the box isn't present so create the new type
    var newType = {name:box.name, maxYearly:box.maxYearly, minYearly:box.minYearly, dailyDiff:box.dailyDiff, type:box.type}
    users[userId].userDefinedBoxes.push(newType);
  }
}

// create or update a greenbox
app.post('/greenbox/:userId', function (req, res) {
  var userId = req.params.userId;

  if(users[userId]) {

    var usersBoxes = users[userId].boxes;
    if(usersBoxes) {
      console.log('trying to update '+JSON.stringify(req.body))

      var found = false;
      // find the box being updated
      for(var i = 0; i < usersBoxes.length; i++) {
        if(usersBoxes[i].boxId == req.body.boxId){
          found = true;

          usersBoxes[i].name = req.body.name;
          addOrUpdateBoxType(userId, req.body);

          break;
        }
      }

      if(!found) {
        // TODO: create new box
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

// get boxes the user can choose from (or they can create a new box)
app.get('/boxes/types/:userId', function(req, res) {
  console.log('Attempting to get all predefined boxes');
  var id = req.params.userId;

  if(id && users[id]) {
    // send all predefined boxes plus whatever boxes the user has defined
    res.send(predefinedBoxes.concat(users[id].userDefinedBoxes));
  }
})

app.post('/boxes/types/:userId', function(req, res) {
  console.log('Attempting to add a new user predefined box');
  var id = req.params.userId;

  addOrUpdateBoxType(id, req.body);
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
