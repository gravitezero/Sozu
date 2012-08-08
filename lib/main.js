module.exports = function(scope){
  this._counter = 0;
  this._args = [];
  this._callback = undefined;
  this._scope = scope || window;
  this._waiting = false;
  this._waiting_needs = [];
  this._done = false;
  this._needs_done = false;
  this._after = [];

  /*
    calling needs multiple times
    optionnaly calling then to set final callback
      if we say then is not optionnal, then it resolves the problem
    optionnaly calling wait to make sozu wait for another one

    finishing needs, calling this.cb
      calling the the final callback (set by then) 
      calling the next sozu needs

    if needs are met before the final callback is set, CRASH
    the waitings are called 2 times

    TODO faire le schema d'execution AVANT de coder
  */

  this._postpone = function(fn) {
    this._after.push(fn);
  };

  this._cb_needs = function() {
    this._counter -= 1;
    this._args.push(arguments);

    if (this._counter === 0) {
      this._cb_final();
    };
  };

  this._cb_final = function() {
    this._needs_done = true;
    if(this._callback) {
      this._callback.apply(this._scope, this._args);
      this._done = true;
      for (var i = 0; i < this._after.length; i++)       
        this._after[i]();
    }
  };

  // PUBLIC API

  this.in = function(scope) {
    this._scope = scope;
    return this;
  }

  this.wait = function(sozu){
    if(!sozu._done) {
      this._waiting = true;
      var that = this;
      sozu._postpone(function(){
        for (var i = 0; i < that._waiting_needs.length; i++) {
          that._waiting_needs[i].fn.apply(that._waiting_needs[i].scope, that._waiting_needs[i].arguments);
        };
      })
    }
    return this;
  };

  this.needs = function(fn){
    this._counter += 1;
    arguments = Array.prototype.slice.call(arguments, 1);
    var that   = this;

    for (var arg = arguments.length - 1; arg >= 0; arg--) if( typeof(arguments[arg]) === 'function' ) {
      var cb = arguments[arg];
      arguments[arg] = function(){
        that._cb_needs.apply(that, [arguments, cb.apply(that.scope, arguments)]);
      };
      break;
    };

    if(!this._waiting)
      fn.apply(this._scope, arguments);
    else
      // TODO find a better solution with a closure.
      this._waiting_needs.push({fn : fn, scope : this._scope, arguments : arguments});

    return this;
  };

  this.then = function(cb) {
    this._callback = cb;
    if(this._needs_done)
      this._cb_final();
    return this;
  };
};