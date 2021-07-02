// 发布订阅模式

class Event {
  obj = {};

  on(eventName, callBack) {
    if (typeof callBack === "function") {
      if (eventName in this.obj) {
        if (Array.isArray(this.obj[eventName])) {
          this.obj[eventName].push(callBack);
        } else {
          console.error("current event has register for once");
        }
      } else {
        this.obj[eventName] = [callBack];
      }
    } else {
      console.error("callback must a function");
    }
  }

  emit(eventName, ...args) {
    if (eventName in this.obj) {
      const callBacks = this.objp[eventName];
      callBacks.forEach((it) => {
        it(...args);
      });
    } else {
      console.error("event not register, name: ", eventName);
    }
  }

  off(eventName) {
    if (eventName in this.obj) {
      delete this.obj[eventName];
    }
  }

  once(eventName, callBack) {
    delete this.obj[eventName];
    this.obj[eventName] = (...args) => {
      callBack(...args);
      delete this.obj[eventName];
    };
  }
}
