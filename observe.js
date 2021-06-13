// 将对象转换为响应式对象，支持数组，嵌套引用，以及添加参数的自动转换

// 根据了解的原理  实现一个简单的依赖收集自动运行模型

function observe(obj) {
  // 数组
  function BindObserveArray() {
    const proxyActionName = [
      "push",
      "pop",
      "shift",
      "unshift",
      "splice",
      "sort",
      "reverse",
    ];
    class ObserveArray extends Array {}

    proxyActionName.forEach((name) => {
      ObserveArray.prototype[name] = function (...item) {
        action();
        if (item.length) {
          item.forEach((it) => {
            if (typeof it === "object") {
              startObserve(it, action);
            }
          });
        }
        return Array.prototype[name].call(this, ...item);
      };
    });

    return ObserveArray;
  }
  // 记录环
  const set = new Set();
  // 绑定action的自定义数组原型
  const ObserveArray = BindObserveArray();
  // 配置get set转换参数
  function observeOption(value, observe, dep) {
    let temp = value;
    return {
      get() {
        if (Dep.target) {
          dep.onDep();
        }
        return temp;
      },
      set(newValue) {
        if (newValue !== temp) {
          dep.notify();
          if (typeof newValue === "object") {
            observe(newValue);
          }
          temp = newValue;
        }
      },
    };
  }

  function defineReactive(obj, key, value) {
    const dep = new Dep();
    Object.defineProperty(obj, key, observeOption(value, observe, dep));
  }

  // 转换函数
  function startObserve(obj, action) {
    if (typeof obj !== "object") {
      throw new Error("observe need a object");
    }
    // 转换本身
    if (Array.isArray(obj)) {
      Object.setPrototypeOf(obj, ObserveArray.prototype);
      for (let value of obj) {
        if (typeof value === "object") {
          if (!set.has(value)) {
            startObserve(value, action);
            set.add(value);
          }
        }
      }
    } else {
      for (let key in obj) {
        const value = obj[key];
        defineReactive(obj, key, value);
        if (typeof value === 'object' && value !== null) {
          if (!set.has(value)) {
            set.add(value);
            startObserve(value);
          }
        }
      }
    }
  }
  startObserve(obj);
}

class Dep {
  subs = [];

  addDep = (watcher) => {
    this.subs.push(watcher);
  };

  onDep = () => {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  notify = () => {
    const subs = this.subs.slice();
    for (let i = 0; i < subs.length; i++) {
      subs[i].update();
    }
  };
}

class Watcher {
  constructor(action, data) {
    this.action = action;
    this.data = data;
    Dep.target = this;
    this.needRun = true;
    this.getParamNames();
    this.getParamValue();
    this.init();
  }

  getParamNames = () => {
    this.paramNames = getParameterNames(this.action);
  };

  getParamValue = () => {
    this.getParamValue = new Function(
      "data",
      "that",
      `
      with(data) {
        (${new Function(
          ...this.paramNames,
          "that.paramValue = Array.from(arguments).slice(0)"
        ).toString()})(${this.paramNames.join(',')})
      }
    `
    );
  };

  init = () => {
    Dep.target = this;
    this.getParamValue(this.data, this);
    this.run(this.paramValue);
    Dep.target = null;
  };

  get = () => {
    Dep.target = this;
    if (this.paramValue) {
      this.oldParamValue = this.paramValue;
    }
    return Promise.resolve().then(() => {
      this.getParamValue(this.data, this);
      Dep.target = null;
    })
  };

  run = (val) => {
    this.action(...val);
  };

  update = () => {
    this.get().then(() => {
      if (this.oldParamValue) {
        this.needRun = false;
        for (let i = 0; i < this.paramValue.length; i++) {
          if (this.oldParamValue[i] !== this.paramValue[i]) {
            this.needRun = true;
            break;
          }
        }
      }
      if (this.needRun) {
        this.run(this.paramValue);
      }
    });
  };

  addDep = (dep) => {
    dep.addDep(this);
  };
}

/**
 * action的结构
 * {
 *  action1: (a, b) => console.log(a, b, '式子1');
 *  action2: (c, d) => console.log(c, d, '式子2');
 *  action3: (e, f) => console.log(e, f, '式子3');
 *  action4: (g, a) => console.log(g, a, '式子4');
 * }
 * 
 */
class Observeable {
  keys = {};
  watchers = [];
  constructor(data, action) {
    observe(data);
    for (let key in action) {
      if (!this.keys[key]) {
        this.keys[key] = true;
        const watcher = new Watcher(action[key], data);
        this.watchers.push(watcher);
      }
    }
    // 将数据传递给action  初始运行 并且开始收集依赖
  }
}

/**
 * helper
 */

function getParameterNames(fn) {
  const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
  const DEFAULT_PARAMS = /=[^,]+/gm;
  const FAT_ARROWS = /=>.*$/gm;
  const code = fn
    .toString()
    .replace(COMMENTS, "")
    .replace(FAT_ARROWS, "")
    .replace(DEFAULT_PARAMS, "");

  const result = code
    .slice(code.indexOf("(") + 1, code.indexOf(")"))
    .match(/([^\s,]+)/g);

  return result === null ? [] : result;
}

data = {
  a: 1,
  b: 2,
  c: 3
}

a = new Observeable(data, {
  a: (a) => console.log(a, '式子一'),
  b: (b) => console.log(b, '式子二'),
  c: (c) => console.log(c, '式子三')
})
