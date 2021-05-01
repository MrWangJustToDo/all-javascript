// 支持ES5的bind polyfill

Function.prototype.bind = function () {
  var action = this;
  var argument = Array.from(arguments);
  var context = argument[0];
  var args = argument.slice(1);
  if (typeof context !== "object") {
    context = window;
  }
  return function () {
    var last = Array.from(arguments);
    var key;
    if (typeof Symbol !== "undefined") {
      key = Symbol();
    } else {
      key = Math.random();
    }
    context[key] = action;
    var re = context[key](args.concat(last));
    delete context[key];
    return re;
  };
};
