var ascoltatore = {
  //using ascoltatore
  type: 'mongo',
  url: 'mongodb://localhost:27017/mqtt',
  pubsubCollection: 'ascoltatori',
  mongo: {}
};

var settings = {
  backend: ascoltatore,
  host: '0.0.0.0',
  port: 8080,
  http: {
    port: 1883,
    host: '0.0.0.0',
    static: './mqtt/',
    bundle: true,
  },
  allowNonSecure: true
};

var http     = require('http')
  , httpServ = http.createServer()
  , mosca    = require('mosca')
  , server = new mosca.Server(settings);

server.attachHttpServer(httpServ);

// httpServ.listen(8080, '192.168.1.56');

server.on('clientConnected', function(client) {
  console.log('client connected!!!!')
    console.log('client connected', client.id);
});

server.on('clientDisconnected', function(client) {
  console.log('client disconnected!!!!')
    console.log('client disconnected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  if(packet.payload[0] != '{') {
    try{
      var jsonPayload = JSON.parse('\"'+packet.payload+'\"');
      console.log('payload: '+JSON.stringify(jsonPayload) + ' to topic: '+packet.topic)
    }catch(ex){}
  }
  else{
    console.log('payload: '+JSON.stringify(packet.payload) + ' to topic: '+ packet.topic)
  }

});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
}

process.on('uncaughtException', function (err) {
  console.log('found uncaught exception')
    console.error(err.stack);
    console.log("Node NOT Exiting...");
});
