module.exports = function(scope){
  this.counter = 0;
  this.args = [];
  this.callback = undefined;
  this.scope = scope || window;
  this.waiting = false;
  this.waitings = [];
  this.after = [];

  this.in = function(scope) {
    this.scope = scope;
    return this;
  }

  this.cb = function() {
    this.counter -= 1;
    this.args.push(arguments);

    if (this.counter === 0) {
      if( this.callback ) {
        this.callback.apply(this.scope, this.args);
        this.done = true;
        for (var i = 0; i < this.after.length; i++) {
          this.after[i]();
        };
      } else {
        this.callback = null;
      };
    };
  };

  this.wait = function(sozu){
    if(!sozu.done) {
      this.waiting === true;
      var that = this;
      sozu.finish(function(){
        for (var i = 0; i < that.waitings.length; i++) {
          that.waitings[i]();
        };
      })
    }
    return this;
  };

  this.needs = function(fn){
    this.counter += 1;
    arguments = Array.prototype.slice.call(arguments, 1);
    var that   = this;

    for (var arg = arguments.length - 1; arg >= 0; arg--) if( typeof(arguments[arg]) === 'function' ) {
      var cb = arguments[arg];
      arguments[arg] = function(){
        that.cb.apply(that, [arguments, cb.apply(that.scope, arguments)]);
      };
      break;
    };
    
    if(!this.waiting) {
      fn.apply(this.scope, arguments);
    } else
      this.waiting.push(function(){
        return fn.apply(this.scope, arguments);
      });

    return this;
  };

  this.then = function(cb) {
    // callback switch to null when needs are met.
    if (this.callback === null) {
      cb.apply(this.scope, this.args);
      this.done = true;
      for (var i = 0; i < this.after.length; i++) {
        this.after[i]();
      };
    } else {
      this.callback = cb;
    }
    return this;
  };

  this.finish = function(fn) {
    this.after.push(fn);
  }
};