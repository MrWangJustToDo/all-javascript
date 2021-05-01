// JS对象深克隆克隆，考虑嵌套引用，不考虑其他数据类型

function deepClone(obj) {
  const map = new Map();
  function startClone(obj) {
    if (typeof obj !== "object") {
      return obj;
    } else {
      const re = map.get(obj);
      if (re) {
        return re;
      } else {
        const temp = Array.isArray(obj) ? [] : {};
        map.set(obj, temp);
        for (let key in obj) {
          temp[key] = startClone(obj[key]);
        }
        return temp;
      }
    }
  }

  return startClone(obj);
}
