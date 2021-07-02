// jsonp工具

// 需要服务器支持的jsonP规则
function jsonp(url, action) {
  const methodName = `jsonp_${Math.random().toString(16).slice(2)}`;

  const query = `callback=${methodName}`;
  if (url.includes("?")) {
    url = url + `&${query}`;
  } else {
    url = url + `?${query}`;
  }

  const script = document.createElement("script");

  script.src = url;

  window[methodName] = action;

  script.onload = () => {
    script.remove();

    delete window[methodName];
  };
  document.body.append(script);
}

// 服务器端写法
const http = require("http");

const port = 10010;

const server = http.createServer((req, res) => {
  let url = req.url;
  if (url.includes("?callback")) {
    const query = url.split("?")[1];
    const [, functionName] = query.split("=");
    res.setHeader("content-Type", "application/json; charset=utf-8");
    res.end(
      `${functionName}(${JSON.stringify([1, 2, 3, 4, { a: 1, b: 2, c: 3 }])})`
    );
  } else {
    res.setHeader("content-Type", "text/html; charset=utf-8");
    res.write(
      "<h2>jsonp服务器 jsonp('127.0.0.1:10010', (...args) => {console.log(args)})</h2>"
    );
    res.end(`
    <script>
    function jsonp(url, callback) {
      let funcName = "FUN_" + Math.random().toString(16).slice(2);
      let newUrl = url + "?callback=" + funcName;
      let script = document.createElement("script");
      script.src = newUrl;
      window[funcName] = callback;
      script.addEventListener("load", () => {
        script.remove();
        delete window[funcName];
      });
      document.body.append(script);
    }
    </script>
    `);
  }
});

server.listen(port, () => console.log(`jsonp server listen ${port}`));
