// Main application. Handles API calls from user and from greenboxes.

const express = require('express')
const parser = require('body-parser')
const app = express()

var greenboxes = {};

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
