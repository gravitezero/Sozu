var mocha           = require('mocha'),
    should          = require('should'),
    sozu           = require('../lib/main');

describe('Sozu', function() {
  it('should be executed after one needs', function(done) {
    var proof = false;
    var test = new sozu(this).

    needs(setTimeout,function(){
      proof = true
    }, 10).

    then(function(results){
      proof.should.equal(true);
      done();
    });      
  });

  it('should be executed after one synchrone needs', function(done) {
    var proof = false;
    var fn = function(callback, msg){
      callback(msg);
    };

    var test = new sozu(this).

    needs(fn,function(msg){
      proof = true;
      return msg;
    }, 'hot dog').

    then(function(results){
      proof.should.equal(true);
      done();
    });      
  });  

  it('should be executed after multiple needs', function(done) {
    var proof = 0;
    var test = new sozu(this).

    needs(setTimeout,function(){
      proof += 1;
    }, 30).

    needs(setTimeout,function(){
      proof += 1;
    }, 10).

    needs(setTimeout,function(){
      proof += 1;
    }, 20).

    then(function(results){
      proof.should.equal(3);
      done();
    });
  });

  it('should receive results of callbacks', function(done) {
    var proof = 0;
    var args = ['tartiflette', 'raclette', 'flammenküche'];
    var test = new sozu(this).

    needs(setTimeout,function(){
      return args[0];
    }, 20).

    needs(setTimeout,function(){
      return args[1];
    }, 30).

    needs(setTimeout,function(){
      return args[2];
    }, 10).

    then(function(){
      for(var index in arguments){
        for(var arg in args) {
                  //cb index,  results
          if(arguments[index] [1] === args[arg])
            proof += 1;
        }
      }

      // TODO this :
      //arguments.should.include()

      proof.should.equal(3);
      done();
    });
  });

  it('should receive one argument of callbacks', function(done) {
    var proof = 0;
    var args = ['tartiflette', 'raclette', 'flammenküche'];
    var test = new sozu(this).

    needs(setTimeout,function(){
    }, 20, args[0]).

    needs(setTimeout,function(){
    }, 30, args[1]).

    needs(setTimeout,function(){
    }, 10, args[2]).

    then(function(){
      for(var index in arguments){
        for(var arg in args) {
                  //cb index, args, first argument
          if(arguments[index] [0]   [0] === args[arg])
            proof += 1;
        }
      }
      proof.should.equal(3);
      done();
    });
  });

  it('should receive multiple arguments of callbacks', function(done) {
    var proof = 0;
    var args = ['tartiflette', 'raclette', 'flammenküche', 'panini', 'kebab', 'tacos'];
    var test = new sozu(this).

    needs(setTimeout,function(){
    }, 20, args[0], args[1]).

    needs(setTimeout,function(){
    }, 30, args[2], args[3]).

    needs(setTimeout,function(){
    }, 10, args[4], args[5]).

    then(function(){
      //console.log(arguments);
      for(var index in arguments){
        for(var arg_index in arguments[index]) {
          for(var arg in args) {
            if(arguments[index][0][arg_index] === args[arg])
              proof += 1;
          }
        }
      }
      proof.should.equal(6);
      done();
    });
  });

  it('should increase needs on the fly', function(done) {
    var proof = 0;
    var args = ['tartiflette', 'raclette', 'flammenküche', 'panini', 'kebab', 'tacos'];
    var test = new sozu(this).

    needs(setTimeout,function(){
      test.needs(setTimeout,function(){
        test.needs(setTimeout,function(){
        }, 10, args[2]);      
      }, 10, args[1]);
    }, 10, args[0]).

    then(function(){
      for(var index in arguments){
        for(var arg in args) {
          if(arguments[index][0][0] === args[arg])
            proof += 1;
        }
      }
      proof.should.equal(3);
      done();
    });
  });

  it('should be combined with other joining points', function(done) {
    var proof = 0;
    var args = ['tartiflette', 'raclette', 'flammenküche', 'panini', 'kebab', 'tacos'];
    var test = new sozu(this).

    needs(setTimeout,function(){
        test2.needs(setTimeout,function(){
      }, 10, args[1]);
    }, 30, args[0]).

    then(function(){
      for(var index in arguments){
        for(var arg in args) {
          if(arguments[index][0][0] === args[arg]) {
            proof += 1;
          }
        }
      }
      proof.should.equal(1);
    });

    var test2 = new sozu(this).

    wait(test).

    needs(setTimeout,function(){
    }, 10, args[1]).

    then(function(){
      for(var index in arguments){
        for(var arg in args) {
          if(arguments[index][0][0] === args[arg]) {
            proof += 1;
          }

        }
      }
      proof.should.equal(3);
      done();
    });
  });
});