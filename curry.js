// 函数柯里化

Function.prototype.curry = function (length, ...args) {
  const action = this;
  function curry(length, ...args) {
    if (args.length >= length) {
      return action.call(this, args.slice(0, length));
    } else {
      return function (...last) {
        return curry.call(this, length, ...args.concat(last));
      };
    }
  }
  return curry(length, ...args);
};
