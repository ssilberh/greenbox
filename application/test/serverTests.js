var request = require('supertest');
var async = require('async');

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

  // call endpoint to create a user
  var createUser = function(cb) {
    request(server)
      .post('/users/steven1')
      .expect(200)
      .then(res => {
        cb();
      })
  }

  // call endpoint to create a box
  var createBox = function(boxType, cb) {
    request(server)
      .post('/users/steven1/boxes')
      .send({
        "type":boxType,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .expect(200)
      .then(res => {
        // return
        cb(null, res.body);
      });
  }

  // ----------------------------------------------------------------
  // Actual test function

  it('ensure application runs and responds to / - expect 200', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
    });

  it('create user - expect 200', function testPath(done) {
      request(server)
        .post('/users/steven1')
        .expect(200, done);
    });

  it('create same user multiple times - expect 400 second time', function testPath(done) {
    async.series([
      function(cb) {
        request(server)
          .post('/users/steven1')
          .expect(200)
          .then(res => {
            cb();
          });
      },
      function(cb) {
        request(server)
          .post('/users/steven1')
          .expect(400)
          .then(res => {
            cb();
          });
      }
    ],
    function(err, results) {
      if(err) done(err);
      else done();
    })});

  it('attempt to find non-existent user - expect 400', function testPath(done) {
    request(server)
      .get('/users/someuserthatdoesntexist')
      .expect(400, done);
  });

  it('attempt to get plant types of non-existent user - expect 400', function testPath(done) {
    request(server)
      .get('/users/someuserthatdoesntexist/plantTypes')
      .expect(400, done);
  });

  it('create user, create a new plant type - expect user-defined plant types to have requested name', function testPath(done) {
    async.series([
      function(cb) {
        request(server)
          .post('/users/steven1')
          .expect(200)
          .then(res => {
            cb();
          })
      },
      function(cb) {
        request(server)
          .post('/users/steven1/plantTypes')
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
            cb();
          });
      },
      function(cb) {
        request(server)
          .get('/users/steven1/plantTypes')
          .set('Accept', 'application/json')
          .expect(200)
          .then(res => {
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
  )});

  it('create user, create a new plant type where max < min yearly temperature - expect 400', function testPath(done) {
    async.series([
      function(cb) {
        request(server)
          .post('/users/steven1')
          .expect(200)
          .then(res => {
            cb();
          })
      },
      function(cb) {
        request(server)
          .post('/users/steven1/plantTypes')
          .send({
            "name":"testBox123",
            "maxYearly":-123,
            "minYearly":123,
            "dailyDiff":40,
            "type":"Terrestrial",
            "userDefined":false
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(400)
          .then(res => {
            cb();
          });
      }
    ],
    function(err, results) {
      if(err) done(err);
      else done();
    }
  )});

  it('create user, create a new plant type, then make update to new plant type - expect user-defined plant to have updated to newest commanded values', function testPath(done) {
    async.series([
      function(cb) {
        request(server)
          .post('/users/steven1')
          .expect(200)
          .then(res => {
            cb();
          })
      },
      function(cb) {
        request(server)
          .post('/users/steven1/plantTypes')
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
            cb();
          });
      },
      function(cb) {
        request(server)
          .get('/users/steven1/plantTypes')
          .set('Accept', 'application/json')
          .expect(200)
          .then(res => {
              var found = false;
              for(var i = 0; i < res.body.length; i++) {
                if(res.body[i].name == 'testBox123') {
                  found = true;
                  break;
                }
              }
              if(!found) {
                cb("Could not find the expected box type that was added previously.");
              } else {

                if(res.body[i].maxYearly == 123 && res.body[i].minYearly == -123) {
                  cb();
                } else {
                  cb("Did not get the proper values for min and max yearly");
                }
              }
          });
      },
      function(cb) {
        request(server)
          .post('/users/steven1/plantTypes')
          .send({
            "name":"testBox123",
            "maxYearly":44,
            "minYearly":-55,
            "dailyDiff":40,
            "type":"Terrestrial",
            "userDefined":false
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(200)
          .then(res => {
            cb();
          });
      },
      function(cb) {
        request(server)
          .get('/users/steven1/plantTypes')
          .set('Accept', 'application/json')
          .expect(200)
          .then(res => {
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
                if(res.body[i].maxYearly == 44 && res.body[i].minYearly == -55) {
                  cb();
                } else {
                  cb("Did not get the proper values for min and max yearly after updating values");
                }
              }
          });
      }
    ],
    function(err, results) {
      if(err) done(err);
      else done();
    }
  )});

  it('create user, try to update pre-defined plant type - expect 400', function(done) {
    async.series([
      function(cb) {
        request(server)
          .post('/users/steven1')
          .expect(200)
          .then(res => {
            cb();
          })
      },
      function(cb) {
        request(server)
          .post('/users/steven1/plantTypes')
          .send({
            "name":"Orchid",
            "maxYearly":123,
            "minYearly":-123,
            "dailyDiff":40,
            "type":"Terrestrial",
            "userDefined":false
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(400)
          .then(res => {
            cb();
          });
      }
    ],
    function(err, result) {
      if(err) done(err);
      else done();
    })});

  it('create user, associate new box with user - expect resulting box be of same type as requested', function(done) {
    async.series([
      function(cb) {
        createUser(cb);
      },
      function(cb) {
        request(server)
          .post('/users/steven1/boxes')
          .send({
            "type":"Orchid",
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(200)
          .then(res => {
            if(res.body.boxType != "Orchid") {
              cb('Returned type when creating box did not match request');
            }
            else if(!res.body.boxId) {
              cb('Expected to be assigned a boxId since one was not provided on request of new box, but no boxId returned.')
            }
            else {
              cb();
            }
          });
      }
    ],
    function(err, result) {
      if(err) done(err);
      else done();
    })});

  it('create user, update box with id on non-exist box - expect 400', function(done) {
    async.series([
      function(cb) {
        request(server)
          .post('/users/steven1')
          .expect(200)
          .then(res => {
            cb();
          })
      },
      function(cb) {
        request(server)
          .post('/users/steven1/boxes')
          .send({
            "type":"Orchid",
            "boxId":"bogusBoxId123"
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(400)
          .then(res => {
              cb();
          });
      }
    ],
    function(err, result) {
      if(err) done(err);
      else done();
    })});

  it('create user, create box with previously undefined plant type - expect 400', function(done) {
    async.series([
      function(cb) {
        createUser(cb);
      },
      function(cb) {
        request(server)
          .post('/users/steven1/boxes')
          .send({
            "type":"fakePlantType",
          })
          .set('Content-Type', 'application/json')
          .set('Accept', 'application/json')
          .expect(400)
          .then(res => {
              cb();
          });
      }
    ],
    function(err, result) {
      if(err) done(err);
      else done();
    })});

  it('create user, create box, update created box - expect to see box updated', function(done) {
    async.series([
      function(cb) {
        createUser(cb);
      },
      function(cb) {
        createBox('Orchid', cb);
      }
    ],
    function(err, result) {
      if(err) {
        done(err);
        return;
      }

      // get box from call to create box
      var box = result[1];
      if(!box) done('Expected to get a box from call to create box')

      request(server)
        .get('/users/steven1/boxes/'+box.boxId)
        .set('Accept', 'application/json')
        .expect(200)
        .then(res => {
          // return
          var returnedBox = res.body;

          if(!returnedBox || returnedBox.boxId != box.boxId || returnedBox.type != box.type){
            done('The box returned did not exist or did not have the expected properties.')
          }
          else {
            done();
          }
        });

    })});
});
