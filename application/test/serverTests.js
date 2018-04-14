var request = require('supertest');
var async = require('async');
var relativeFilepathToMainApp =

describe('Greenbox application tests', function () {
  var server;

  // ----------------------------------------------------------------
  // Test setup and cleanup

  beforeEach(function () {
    // We must clear the cache or the server will not close properly between runs.
    // See https://glebbahmutov.com/blog/how-to-correctly-unit-test-express-server/
    delete require.cache[require.resolve('../index')];
    server = require('../index');
  });
  afterEach(function () {
    server.close();
  });

  // ----------------------------------------------------------------
  // Actual test function

  // test to ensure the app is up
  it('responds to /', function testSlash(done) {
  request(server)
    .get('/')
    .expect(200, done);
  });

  // create a user
  it('create user', function testPath(done) {
    request(server)
      .post('/user/steven1')
      .expect(200, done);
  });

  // create a user
  it('create user, create a new box', function testPath(done) {
    async.series([
      function(cb) {
        console.log('creating user')
        request(server)
          .post('/user/steven1')
          .expect(200)
          .then(res => {
            console.log('done creating user')
            cb();
          })
      },
      function(cb) {
        console.log('creating box')

        request(server)
          .post('/plantType/steven1')
          .send({
            "name":"testBox123",
            "maxYearly":123,
            "minYearly":-123,
            "dailyDiff":40,
            "type":"Terrestrial",
            "userDefined":false
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(200)
          .then(res => {
            console.log('done creating box')
            cb();
          });
      },
      function(cb) {
        console.log('checking box')

        request(server)
          .get('/plantType/steven1')
          .set('Accept', 'application/json')
          .expect(200)
          .then(res => {
              console.log('here:'+JSON.stringify(res.body))
              var found = false;
              for(var i = 0; i < res.body.length; i++) {
                if(res.body[i].name == 'testBox123') {
                  found = true;
                  break;
                }
              }

              if(!found) {
                cb("Could not find the expected box type that was added previously.")
              } else {
                cb();
              }
          });
      }
    ],

    function(err, results) {
      if(err) done(err);
      else done();
    }
  )

  });
});
