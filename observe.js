// 将对象转换为响应式对象，支持数组，嵌套引用，以及添加参数的自动转换

function observe(obj, action) {
  // 数组
  function BindObserveArray(action) {
    const proxyActionName = ["push", "pop", "reverse", "concat", "splice"];
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
  const ObserveArray = BindObserveArray(action);
  // 配置get set转换参数
  function observeOption(value, observe, action) {
    let temp = value;
    return {
      get() {
        return temp;
      },
      set(newValue) {
        if (newValue !== temp) {
          if (action && typeof action === "function") {
            action(newValue);
          }
          if (typeof newValue === "object") {
            observe(newValue, action);
          }
          temp = newValue;
        }
      },
    };
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
        if (typeof value !== "object") {
          // 如果键的值是普通类型，不是数组需要将当前转换为get set
          Object.defineProperty(
            obj,
            key,
            observeOption(value, startObserve, action)
          );
        } else {
          // 是对象，需要判断递归转换
          Object.defineProperty(
            obj,
            key,
            observeOption(value, startObserve, action)
          );
          if (!set.has(value)) {
            set.add(value);
            startObserve(value, action);
          }
        }
      }
    }
  }

  startObserve(obj, action);
}
