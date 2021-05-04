// 实现 express
const http = require("http");

function express() {
  const middleware = [];
  function app(req, res) {
    let index = 0;
    function next() {
      const current = middleware[index++];
      if (current.path === "*" || req.url === current.path) {
        current.handler(req, res, next);
      } else {
        next();
      }
    }
    next();
  }

  app.use = (path, handler) => {
    if (typeof path === "function") {
      middleware.push({ path: "*", handler: path });
    } else {
      middleware.push({ path, handler });
    }
  };

  app.listen = (port, callback) =>
    process.nextTick(() => http.createServer(app).listen(port, callback));

  return app;
}

let app = express();

app.use((req, res, next) => {
  console.log(req.url, req.method);
  next();
});

app.use("/foo", (req, res, next) => {
  console.log("进入foo");
  next();
});

app.use((req, res, next) => {
  res.writeHead(200, {
    "Content-type": `text/html; charset=utf-8`,
  });
  res.end(`访问路径是: ${req.url}`);
});

// http.createServer(app).listen(10010, () => {
//   console.log("listening on port 10010");
// });

app.listen(10010, () => console.log("listening on port 10010"));
