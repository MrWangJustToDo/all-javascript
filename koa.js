// 简单实现 koa
const http = require("http");

const responseMiddleWare = (ctx, next) => {
  return next().then(() => {
    console.log('发出响应');
    if (ctx.body) {
      ctx.res.end(ctx.body);
    }
  });
};

function Koa() {
  if (!this instanceof Koa) {
    throw new Error("create error, must use new");
  }

  this.middleware = [responseMiddleWare];
}

Koa.prototype.compose = function (middleware, next) {
  return function wrapMiddleWare(params) {
    let index = -1;
    function dispatch(i) {
      if (i <= next) {
        throw new Error();
      }
      index = i;
      let fn = middleware[i] || next;
      if (!fn) return Promise.resolve();
      try {
        return Promise.resolve(fn(params, () => dispatch(i + 1)));
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return dispatch(0);
  };
};

Koa.prototype.use = function (middleware) {
  this.middleware.push(middleware);
};

Koa.prototype.handle = async function (req, res) {
  const ctx = { req, res };
  return await this.compose(this.middleware)(ctx);
};

Koa.prototype.listen = function (...args) {
  process.nextTick(() => {
    http.createServer(this.handle.bind(this)).listen(...args);
  });
};

const app = new Koa();

app.use(async (ctx, next) => {
  await next();
  console.log("------------------");
  // const rt = ctx.response.get("X-Response-Time");
  // console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(ms);
  // ctx.set("X-Response-Time", `${ms}ms`);
});

// response

app.use(async (ctx, next) => {
  ctx.body = "Hello World";
  console.log("开始响应数据");
  await next();
});

app.listen(3000, () => console.log("listen 3000"));
