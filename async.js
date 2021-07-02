// 基于生成器实现async await

const delay = (time, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), time));

function* test() {
  console.log("第一阶段");
  const a = yield delay(1000, 3);
  console.log("第二阶段");
  const b = yield delay(3000, 10);
  console.log("第三阶段");
  const c = yield delay(5000, 30);
  console.log("最后阶段", a + b + c);
  return a + b + c;
}

// 自动执行生成器函数
function run(generateAction) {
  return new Promise((resolve, reject) => {
    const generater = generateAction();
    let generated;
    try {
      generated = generater.next();
    } catch (e) {
      reject(e);
    }
    next();

    function next() {
      if (generated.done) {
        resolve(generated.value);
      } else {
        Promise.resolve(generated.value).then(
          (newValue) => {
            try {
              generated = generater.next(newValue);
              next();
            } catch (e) {
              reject(e);
            }
          },
          (e) => reject(e)
        );
      }
    }
  });
}
