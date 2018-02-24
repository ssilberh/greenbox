// Main application. Handles API calls from user and from greenboxes.

const express = require('express')
const parser = require('body-parser')
const app = express()

app.use(parser.urlencoded({ extended: false }))
app.use(parser.json())

app.get('/', (req, res) => res.send('Hello World!'))

app.post('/greenbox', (req, res) =>
  res.send('Greenbox created or updated ' + req.body.id)
)

app.post('/user', (req, res) =>
  res.send('User created or updated ' + req.body.id)
)

app.listen(3000, () => console.log('Example app listening on port 3000!'))
