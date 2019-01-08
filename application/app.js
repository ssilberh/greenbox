// Main application. Handles API calls from user and from greenboxes.
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var serveStatic = require('serve-static');

const bodyParser = require('body-parser');

// According to https://www.npmjs.com/package/express-session:
// Warning The default server-side session storage, MemoryStore, is purposely
// not designed for a production environment. It will leak memory under most
// conditions, does not scale past a single process, and is meant for debugging
// and developing.
// TODO: use connect-mongo? (https://www.npmjs.com/package/connect-mongo)
const session = require('express-session');
const express = require('express');
const parser = require('body-parser');
const app = express();
const mongoose = require('mongoose');

mongoose.promise = global.Promise;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// TODO: configure and change secret
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

mongoose.connect('mongodb://localhost:27017/greenbox', { useNewUrlParser: true });

require('./models/Users.js');
require('./config/passport.js');
app.use(require('./routes'));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("connected to db!");
});

// types of boxes
const boxTypeEnum = Object.freeze(["Terrestrial", "Aquatic"])

// seed users with an already-existing box
// also, define a box that only this user can see - they created this (but populate
// it with fake data for now)
var users = [
  {
    "id":123,
    "boxes":['b0001', 'b0002'],
    "gender":"male",
    "userDefinedBoxTypes":[
      {name:
        "Steven's Cool Plant",
        maxYearly:55,
        minYearly:36,
        dailyDiff:6,
        type:boxTypeEnum[1],
        userDefined:true
      }
    ]
  }];

// list of boxes; dereference by unique boxId field
// TODO: back by DB, unique key on boxId
var boxes = [
  { boxId:"b0001", name:"Lemon Tree", modules:['m-p0001'] }, { boxId:"b0002", name:"Orchid" }
];

// list of modules; users dereference by id
// TODO: back by DB, unique key on id
var modules = [
    {id:"m-p0001", type:"peltierType1", health:"good", lastHeardFrom:(new Date())}
  ];

// list of types of modules. Holds parameters specific to a given type of module.
// Name must be unique.
var moduleTypes = [
    {name:"peltierType1", purpose:"Temperature Control", maxCommandedTemp:80, minCommandedTemp:40}
  ];

// define a few boxes for the user that come by default
var predefinedBoxTypes = [
  {name:"Lemon Tree", maxYearly:70, minYearly:46, dailyDiff:10, type:boxTypeEnum[0], userDefined:false },
  {name:"Orchid", maxYearly:88, minYearly:76, dailyDiff:5, type:boxTypeEnum[0], userDefined:false }
];

// given a unique identifier, dereference a given list. Eventually, this will
// be backed by a database.
var lookup = function(id, idName, collection) {
  for(var i = 0; i < collection.length; i++) {
    if(collection[i][idName] == id) {
      return collection[i];
    }
  }
  return null;
}

// update an element in an array/a document in a database depending on backing structure
var addOrUpdate = function(id, idName, collection, newValue) {
  for(var i = 0; i < collection.length; i++) {
    if(collection[i][idName] == id) {
      collection[i] = newValue;
    }
  }
  collection.push(newValue);
}

var generateRandomId = function() {
  return Math.floor(Math.random()*10000000000);
}

var staticName = path.join(__dirname, "/../web-client/");

// enable cors so we can hit site from outsite localhost
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static(staticName));

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

// Find if the type of the inputted box is already present in the predefinedBoxTypes
// or userDefinedBoxTypes. If it isn't, create a new type in the userDefinedBoxTypes.
// Returns true if this method created a new plant type, false otherwise.
var addOrUpdatePlantType = function(userId, box) {
  var user = lookup(userId, 'id', users);

  // enforce rule that max must be more than min yearly temperature
  if(box.minYearly > box.maxYearly) {
    return false;
  }

  // check if the box is in the predefined boxes list
  for(var i = 0; i < predefinedBoxTypes.length; i++) {
    if(predefinedBoxTypes[i].name == box.name) {
      return false;
    }
  }

  // TODO: if this doesn't exist, create it
  if(userId && user && user.userDefinedBoxTypes) {
    // check if the box is in the user defined boxes list
    for(var i = 0; i < user.userDefinedBoxTypes.length; i++) {

      // we found a box type with the same name, so update the box
      if(user.userDefinedBoxTypes[i].name == box.name) {
        var prev = user.userDefinedBoxTypes[i];
        prev.maxYearly = box.maxYearly;
        prev.minYearly = box.minYearly;
        prev.dailyDiff = box.dailyDiff;
        prev.type = box.type;
        return true;
      }
    }

    // if we've gotten here, the box isn't present so create the new type
    var newType = {name:box.name, maxYearly:box.maxYearly, minYearly:box.minYearly, dailyDiff:box.dailyDiff, type:box.type, userDefined:true}
    user.userDefinedBoxTypes.push(newType);
    return true;
  }
}

// create or update a box associated with a user
app.post('/users/:userId/boxes', function (req, res, next) {
  var userId = req.params.userId;
  var boxId = req.body.boxId;
  var boxType = req.body.type;
  var user = lookup(userId, 'id', users);

  // box we will be returning to the user - either new or updated box
  var ret;

  // if we are creating a box (no id is passed), assign a new unique box id
  if(!boxId) {
    boxId = 'b'+generateRandomId();
  }
  else if(!user || !user.boxes || user.boxes.indexOf(boxId) == -1) {
    // if we have a requested boxId, make sure that the requested boxId exists
    // for the user
    res.sendStatus(400);
    return;
  }

  if(user && boxId && boxType) {
    // lookup the posted box type in the user-defined box types and predefined box types.
    // We expect that this box type already exists, and if it does not, the
    // request was invalid.
    var userDefinedType = lookup(boxType, 'name', user.userDefinedBoxTypes);
    var predefinedType = lookup(boxType, 'name', predefinedBoxTypes);

    if(userDefinedType || predefinedType) {
      // if the user does not have a box array, create an empty one
      var usersBoxes = user.boxes;
      if(!usersBoxes) {
        user.boxes = [];
      }

      // Copy values out of body of request, update boxes with newest box.
      // Then, associate this box with the requested user.
      var box = {'boxId': boxId, 'boxType': boxType};
      ret = box;
      addOrUpdate(boxId, 'boxId', boxes, box);

      // link box to a user if the user does not already have a reference to this box id
      if(user.boxes.indexOf(boxId) == -1) {
        user.boxes.push(boxId);
      }
    }
  }

  if(ret) {
    res.status(200).send(ret);
  }
  else {
    res.sendStatus(400);
  }

  next();
});

// send all boxes for a given user
app.get('/users/:userId/boxes', function(req, res, next) {
  var userId = req.params.userId;
  var user = lookup(userId, 'id', users);

  if(user) {
    res.status(200).send(user.boxes);
  }
  else {
    res.sendStatus(400);
  }

  next();
});

// return the requested box for the requested user
app.get('/users/:userId/boxes/:boxId', function(req, res, next) {
  var userId = req.params.userId;
  var boxId = req.params.boxId;
  var user = lookup(userId, "id", users);
  var box = lookup(boxId, "boxId", boxes);

  // check that this box belongs to the requested user, return box.
  // Otherwise, return 400.
  if(user && box) {
    res.status(200).send(box);
  }
  else {
    res.sendStatus(400);
  }

  next();
});

// get a greenbox
app.get('/greenboxes/:boxId', function (req, res, next) {
  var id = req.params.boxId;
  res.send();

  next();
});

// create plant type
app.post('/users/:userId/plantTypes', function(req, res, next) {
  var id = req.params.userId;

  var createdOrUpdated = addOrUpdatePlantType(id, req.body);
  if(createdOrUpdated) {
    res.sendStatus(200);
  } else {
    // the given plant type is pre-defined and cannot be updated
    res.sendStatus(400);
  }

  next();
});

// get plant types the user can choose from
app.get('/users/:userId/plantTypes', function(req, res, next) {
  var id = req.params.userId;
  var user = lookup(id, 'id', users);

  if(id && user) {
    // send all predefined boxes plus whatever boxes the user has defined
    res.status(200).send(predefinedBoxTypes.concat(user.userDefinedBoxTypes));
  }
  else {
    res.sendStatus(400);
  }

  next();
});

// create a user
app.post('/users/:userId', function (req, res, next) {
  var id = req.params.userId;
  var user = lookup(id, 'id', users);

  if(id && !user) {
    addOrUpdate(id, 'id', users, { 'id':id, 'userDefinedBoxTypes':[] });
    res.status(200).send(user);
  }
  else{
    res.sendStatus(400);
  }

  next();
})

// get a user
app.get('/users/:userId', function (req, res, next) {
  var id = req.params.userId;
  var user = lookup(id, 'id', users);

  if(id && user) {
    res.status(200).send(user);
  }
  else {
    res.sendStatus(400);
  }

  next();
})

// get a module type (like heating module, etc). ModuleTypes cannot be created
// by the client and must be defined by the application
app.get('/moduleTypes', function(req, res, next) {
  res.status(200).send(moduleTypes);

  next();
});

// create a module. Module is assigned an identifying guid on creation.
app.post('/users/:userId/boxes/:boxId/modules', function(req, res, next) {
  var toAdd = req.body;

  if(!toAdd.type) {
    res.sendStatus(400);
  } else {
    // TODO: generate real guid
    var newModule = {type:toAdd.type, id:generateRandomId()}

    // TODO: persist this into db
    modules.push(newModule);

    res.send(newModule);
  }

  next();
});

// get a module
app.get('/users/:userId/boxes/:boxId/modules/:moduleId', function(req, res, next) {
  var id = req.params.moduleId;

  var ret = lookup(id, "id", modules);

  res.status(200).send(ret);

  next();
});

// test connection to site
app.get('/', function(req, res, next) {
  res.sendStatus(200);
  next();
})

var greenboxServer = app.listen(3000)
module.exports = greenboxServer;
