module.exports = function(scope){
  this.counter = 0;
  this.args = [];
  this.callback = undefined;
  this.scope = scope || window;

  this.cb = function() {
    this.counter -= 1;
    this.args.push(arguments);

    if (this.counter === 0) {
      if( this.callback )
        this.callback.apply(this.scope, this.args);
      else
        this.callback = null;
    };
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
    
    fn.apply(this.scope, arguments);

    return this;
  };

  this.then = function(cb) {
    this.callback = cb;

    if (this.callback === null)
      this.callback.apply(this.scope, this.args);

    return this;
  }

  this.in = function(scope) {
    this.scope = scope;

    return this;
  }
};