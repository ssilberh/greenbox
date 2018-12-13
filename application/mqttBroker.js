// var mosca = require('mosca');

var ascoltatore = {
  //using ascoltatore
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

var settings = {
  backend: ascoltatore
};

// var server = new mosca.Server(settings);

var http     = require('http')
  , httpServ = http.createServer()
  , mosca    = require('mosca')
  , server = new mosca.Server(settings);

server.attachHttpServer(httpServ);

httpServ.listen(4000);

server.on('clientConnected', function(client) {
  console.log('client connected!!!!')
    console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('Published', packet.payload);
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}
