module.exports = function(scope, name){
  this._name = name;
  this._counter = 0;
  this.result = [];
  this._callback = undefined;
  this._scope = scope || undefined;
  this._waiting = false;
  this._waiting_needs = [];
  this._done = false;
  this._needs_done = false;
  this._after = [];
  this._phs = [];
  this._ph_names = {};
  this._ph_index = 0;

  this._postpone = function(fn) {
    this._after.push(fn);
  };

  this._cb_needs = function(results) {
    this._counter -= 1;
    this.result.push(results);

    if (this._counter === 0) {
      this._cb_final();
    };
  };

  this._cb_final = function() {
    this._needs_done = true;
    if(this._callback) {
      this._callback.apply(this._scope, this.result);
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
        that._waiting = false;
        for (var i = 0; i < that._waiting_needs.length; i++) {
          that._waiting_needs[i].f.apply(that._waiting_needs[i].scope, that._waiting_needs[i].arguments);
        };
      })
    }
    return this;
  };

  this.needsEach = function(items, fn, fnArgs) {

    var that = this;
    this._counter += 1;
    var fArgs = ( typeof(fnArgs) === 'function' ) ? fnArgs : function(fnArgs){ return [fnArgs] };

    var f = function(n, fn, fArgs){
      for (var i = 0; i < n.length; i++)
        that.needs.apply(that, Array().concat(fn, fArgs(n[i])));

      that._counter -= 1;
      if(that._counter === 0)
        that._cb_final();
      // TODO What happen if we only have synchrone function to needs ???
    }

    if (!this._waiting)
      f.call(this.scope, items, fn, fArgs);
    else
      this._waiting_needs.push({f : f, scope : this._scope, arguments : [items, fn, fArgs]});

    return this;
  };

  this.needs = function(fn){
    arguments = Array.prototype.slice.call(arguments, 1);
    var that = this;
    this._counter += 1;  

    for (var arg = arguments.length - 1; arg >= 0; arg--) if( typeof(arguments[arg]) === 'function' ) {
      var cb = arguments[arg];
      arguments[arg] = function(){
        that._cb_needs.call(that, {arguments: arguments, results: cb.apply(that._scope, arguments)});
      };
      break;
    };

    // no callback found, probably synchrone function we have to set the callback
    var f = (cb) ? fn : function(){
      that._cb_needs.call(that, {arguments: arguments, results: fn.apply(that._scope, arguments)});
    }

    if(!this._waiting)
      f.apply(this._scope, arguments);
    else// TODO find a better solution with a closure.
      this._waiting_needs.push({f : f, scope : this._scope, arguments : arguments});

    return this;
  };

  this.then = function(cb) {
    this._callback = cb || function(){};
    if(this._needs_done)
      this._cb_final();
    return this;
  };

  /*
   * About Placeholder :
   * When you will compute the results of a needs which is not ready yet, you can use a placeholder.
   * Placeholders use array to point to not yet ready results.
   * You will get as a placeholder, an Array of the results, the results will be added to the array when they are ready.
   * TODO btw, I should find a better name instead of placeholder, something like Promises. 
   */

  this.placeholder = function(ph_name) {
    if (typeof(ph_name) === 'string') {
      ph_name = [ph_name];
    }

    if (Object.prototype.toString.apply(ph_name) === '[object Array]') {
      for (var i = 0; i < ph_name.length; i++) {
        if (typeof(ph_name[i]) !== 'string')
          throw 'placeholder must get an array of string or a string';
        this._ph_names[ph_name[i]] = this.index;
        this._phs[this._ph_names[ph_name[i]]] = [];
        this.index += 1;
      };
    } else
      throw 'placeholder must get a string or an array of string';
  };

  this.setPlaceholder = function(ph_name, ph) {
    if (typeof(ph_name) !== 'string')
      throw 'first argument of setPlaceholder must be a string';

    if (Object.prototype.toString.apply(ph) === '[object Array]')
      for (var i = 0; i < ph.length; i++)
        this._phs[this._ph_names[ph_name]].push(ph[i]);
    else
      this._phs[this._ph_names[ph_name]].push(ph);
  };

  this.getPlaceholder = function(ph_name) {
    if (typeof(ph_name) !== 'string')
      throw 'getPlaceholder must get a string';
    return this._phs[this._ph_names[ph_name]];
  };
};