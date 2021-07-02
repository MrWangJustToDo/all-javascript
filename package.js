// 简单打包函数
const fs = require("fs");

const keyCache = Object.create(null);

const moduleCache = Object.create(null);

const regex1 = /require\s*\(\s*(['|"])(.*?)\1\s*\)\s*/g;
const regex2 = /require\s*\(\s*(['|"])(.*?)\1\s*\)\s*/;

const getFileContent = async (filePath) => {
  return await fs.promises.readFile(filePath, { encoding: "utf-8" });
};

const getDeps = (content) => {
  const all = content.match(regex1);
  if (all) {
    return all.map((it) => regex2.exec(it)[2]);
  } else {
    return [];
  }
};

const loadAll = async (entry) => {
  if (!(entry in keyCache)) {
    keyCache[entry] = Math.random().toString(16).slice(2);
    const content = await getFileContent(entry);
    moduleCache[keyCache[entry]] = new Function(
      "require",
      "module",
      "exports",
      content
    );
    return Promise.all(getDeps(content).map((it) => loadAll(it)));
  }
  return Promise.resolve();
};

function stringify(obj) {
  let re = "{";
  for (let key in obj) {
    re += "'" + key + "':";
    if (typeof obj[key] == "function") {
      re += obj[key].toString() + ",\n";
    }
  }
  re += "}";
  return re;
}

function bootStrap(entry, output) {
  return loadAll(entry).then(() => {
    const content = `
const entry = '${entry}';
const allModuleContent = ${stringify(moduleCache)};
const allModuleId = ${JSON.stringify(keyCache)};
const cache = {};
function require(entry) {
  const id = allModuleId[entry];
  if (!(id in cache)) {
    const module = {exports: {}};
    cache[id] = module;
    allModuleContent[id](require, module, module.exports)
  }
  return cache[id].exports;
}
require(entry);
`;
    return fs.promises.writeFile(output, content);
  });
}

bootStrap("./preload_main.js", "bundle.js");
