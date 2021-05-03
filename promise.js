// 初步实现promise

class MyPromise {
  static Pending = "pending";
  static Fulfilled = "fulfilled";
  static Reject = "reject";

  constructor(excutor) {
    // 当前promise的值
    this.value;
    // 当前promise的状态
    this.state = MyPromise.Pending;
    // 当前promise的then回调
    this.callBack = {};
    // 执行
    excutor(this.resolve, this.reject);
  }

  resolve = (value) => {
    if (this.state === MyPromise.Pending) {
      this.state = MyPromise.Fulfilled;
      this.value = value;
      this.callBack.resolveCallback(value);
    }
  };

  reject = (value) => {
    if (this.state === MyPromise.Pending) {
      this.state = MyPromise.Reject;
      this.value = value;
      this.callBack.rejectCallback(value);
    }
  };

  then = (resolveCallback, rejectCallback) => {
    if (typeof resolveCallback !== "function") {
      resolveCallback = (value) => value;
    }
    if (typeof rejectCallback !== "function") {
      rejectCallback = (value) => {
        throw value;
      };
    }
    // 将回调存起来
    this.callBack.resolveCallback = resolveCallback;
    this.callBack.rejectCallback = rejectCallback;

    // 返回一个新的Promise
    return new MyPromise((resolve, reject) => {
      // 如果当前执行的时候，前一个Promise已经确定了状态
      if (this.state === MyPromise.Fulfilled) {
        setTimeout(() => {
          try {
            resolve(resolveCallback(this.value));
          } catch (e) {
            reject(e);
          }
        });
      } else if (this.state === MyPromise.Reject) {
        setTimeout(() => {
          try {
            resolve(rejectCallback(this.value));
          } catch (e) {
            reject(e);
          }
        });
      } else {
        // 如果状态未确定，重新修改前一个promise的callback回调
        this.callBack.resolveCallback = (value) => {
          try {
            re.resolve(resolveCallback(value));
          } catch (e) {
            re.reject(e);
          }
        };

        this.callBack.rejectCallback = (value) => {
          try {
            re.resolve(rejectCallback(value));
          } catch (e) {
            re.reject(e);
          }
        };
      }
    });
  };

  catch = (rejectCallback) => {
    if (typeof rejectCallback !== "function") {
      rejectCallback = (reason) => {
        throw reason;
      };
    }
    return this.then(undefined, rejectCallback);
  };
}

function delay(time, value) {
  return new MyPromise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, time);
  });
}

a = delay(1000, 10)
  .then((a) => (console.log(a), a))
  .catch()
  .then(console.log)
  .catch()
  .then(console.log)
  .then(() => {
    throw 30;
  })
  .then()
  .catch()
  .catch(console.log);
