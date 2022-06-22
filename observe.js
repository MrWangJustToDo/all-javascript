// 响应式数据  首先需要将数据转换为响应式，其次访问数据时访问的get方法，此时需要在数据的依赖中加上当前访问数据的表达式

// 实现目标  对于普通的数据类型做到兼容，对于action嵌套也做到兼容

/*
先简单实现功能
具体需要的所有声明
  Observe对象   功能：将一个合法的对象转换为一个响应式对象
  Dep对象   功能：每一个响应式对象都需要的一个属性，用于记录当前对象的所有依赖以及触发依赖重新运行
  Watcher对象   功能：每一个表达式都会变成一个Watcher对象，具有运行和更新方法

后续
添加computed
添加watcher
*/

// 记录下当前访问变量的表达式
let currentWatcher;

let id = 0;

const proxyArrayMethod = [
  "pop",
  "push",
  "sort",
  "shift",
  "splice",
  "unshift",
  "reverse",
];

// 尝试转换一个数据为Observe
function observable(data) {
  if (typeof data === "object" && data !== null) {
    if (data.__ob__) {
      return data;
    } else {
      return new Observe(data);
    }
  }
}

class Observe {
  constructor(data) {
    this.startObserve(data);
  }

  startObserve(data) {
    // 对于不是对象的数据不执行
    if (typeof data !== "object" || data === null) {
      return;
    }
    // 开始进行转换
    this.data = data;
    this.dep = new Dep();
    if (!Object.prototype.hasOwnProperty.call(data, "__ob__")) {
      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false,
        configurable: false,
      });
      if (Array.isArray(data)) {
        this.observeArray(data);
      } else {
        this.observeObj(data);
      }
    } else {
      // 这个判断就可以判断对象是否有环，不需要再进行额外的判断处理
      console.log("observe!", data);
    }
  }

  BindObserveArray() {
    class ObserveArray extends Array {}

    proxyArrayMethod.forEach((name) => {
      ObserveArray[name] = function (...item) {
        const ob = this.__ob__;
        const result = Array.prototype[name].call(this, ...item);
        if (name === "push" || name === "unshift") {
          item.forEach((it) => {
            if (typeof it === "object") {
              observable(it);
            }
          });
        }
        // 通知依赖表达式重新运行
        ob.dep.notify();
        return result;
      };
    });

    return ObserveArray;
  }
  // 对于数组的处理   只需要劫持一些数组方法  还有些问题需要理清
  observeArray(data) {
    Object.setPrototypeOf(data, this.BindObserveArray());
  }

  // 对于普通对象的处理  循环每一项进行修改
  observeObj(data) {
    const keys = Object.keys(data);
    for (let key of keys) {
      this.defineReactive(data, key, data[key]);
    }
  }

  // 这个过程需要完善
  defineReactive(obj, key, value) {
    var dep = new Dep();
    // 先不考虑当前属性是一个getter
    let childOb = observable(value);
    Object.defineProperty(obj, key, {
      get: function reactiveGetter() {
        if (currentWatcher) {
          dep.onDep();
          // 关联到当前的子项
          if (childOb) {
            childOb.dep.onDep();
          }
        }
        return value;
      },
      set: function reactiveSetter(newVal) {
        // 相同不做任何处理
        if (Object.is(newVal, value)) {
          return;
        }
        value = newVal;
        childOb = observable(newVal);
        dep.notify();
      },
    });
  }
}

// 原始数据中的每一个字段  都要为它创建一个对象，这个对象的作用是存储依赖  及那些表达式依赖于这个字段，这样当这个字段修改时可以出发对应的表达式重新运行
// 每一个表达式应该具有一个唯一的id，在创建依赖时可以判断是否已经存在
class Dep {
  ids = {};
  watchers = [];

  // 添加依赖
  onDep() {
    if (currentWatcher) {
      if (!this.ids[currentWatcher.id]) {
        this.ids[currentWatcher.id] = true;
        this.watchers.push(currentWatcher);
      }
    } else {
      console.log("当前不存在表达式调用");
    }
  }

  // 重新运行所有依赖的表达式
  notify() {
    const watchers = this.watchers.slice(0);
    // 清除当前依赖
    this.ids = {};
    this.watchers = [];
    watchers.forEach((watcher) => watcher.run());
  }

  // 清除所有依赖
  clearAll() {
    this.ids = {};
    this.watchers = [];
  }
}

// 每一个表达式对应的Watcher
class Watcher {
  constructor(data, action) {
    this.id = id++;
    this.data = data;
    this.action = action;
    this.withDataAction();
    this.run();
  }

  withDataAction() {
    this.action = new Function(
      "data",
      `
    with(data) {
      (${this.action.toString()})()
    }
    `
    );
  }

  run() {
    currentWatcher = this;
    this.action(this.data);
    currentWatcher = null;
  }
}

class Active {
  constructor(data, action) {
    this.data = data;
    this.action = action;
    this.init();
  }

  init() {
    const keys = Object.keys(this.action);
    for (let key of keys) {
      new Watcher(this.data, this.action[key]);
    }
  }
}

class ObserveAction {
  constructor(data, action) {
    this.data = data;
    this.action = action;
    // 转换数据
    new Observe(data);

    new Active(data, action);
  }
}

var data = {
  a: 10,
  b: 100,
  c: { d: 100, e: 10 },
  d: [1, 2, 3],
  f: [1, 2, { g: 100101 }],
};

new ObserveAction(data, {
  a: () => console.log(a, "a 修改"),
  b: () => console.log(b, "b 修改"),
  c: () => console.log(c, "c 修改"),
  d: () => console.log(c.e, "c.e 修改"),
  e: () => console.log(d, "d 修改"),
  f: () => console.log(d[0], "d[0] 数组不能精确修改"),
  g: () => console.log(f, "f 修改"),
  h: () => console.log(f.g, "f.g 修改"),
  i: () => console.log(c.t, "c.t 修改"),
  // g: { bg: () => console.log(a, "嵌套action  a修改") },
});
