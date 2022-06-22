// json解析器

var jsonText =
  '[111,222e100, {"a":3},{ "b " :true,"c":"foobar","d":[1,false,[null,4,{"x":1,"y":2, "e": undefined}]]}],{a:1}';

function parse(jsonString) {
  let index = 0;
  const startParse = (str) => {
    while (str[index] === " " || str[index] === "," || str[index] === ":") {
      index++;
    }
    if (index < jsonString.length) {
      if (str[index] === "[") {
        index++;
        return parseArray(str);
      } else if (str[index] === "{") {
        index++;
        return parseObject(str);
      } else {
        return parseValue(str);
      }
    }
  };
  const parseNumber = (val) => {
    if (!isNaN(val)) {
      return Number(val);
    }
    return val;
  };
  const parseString = (val) => {
    return val;
  };
  const parseNull = (val) => {
    if (typeof val === "string" && val === "null") {
      return null;
    }
    return val;
  };
  const parseUndefined = (val) => {
    if (typeof val === "string" && val === "undefined") {
      return undefined;
    }
    return val;
  };
  const parseBoolean = (val) => {
    if (typeof val === "string" && (val === "true" || val === "false")) {
      if (val === "true") {
        return true;
      } else {
        return false;
      }
    }
    return val;
  };
  const parseObject = (str) => {
    const re = {};
    while (index < str.length && str[index] !== "}") {
      re[startParse(str)] = startParse(str);
    }
    index++;
    return re;
  };
  const parseArray = (str) => {
    const re = [];
    while (index < str.length && str[index] !== "]") {
      re.push(startParse(str));
    }
    index++;
    return re;
  };
  const parseValue = (str) => {
    const endChar = [",", "{", "}", "[", "]", ":"];
    let re = "";
    while (index < str.length && !endChar.includes(str[index])) {
      if (str[index] !== '"' && str[index] !== " ") {
        re += str[index++];
      } else {
        index++;
      }
    }
    re = parseString(re);
    re = parseNumber(re);
    re = parseNull(re);
    re = parseUndefined(re);
    re = parseBoolean(re);
    return re;
  };

  if (jsonString && typeof jsonString === "string") {
    const re = startParse(jsonString);
    if (index !== jsonString.length) {
      console.error("多个入口, index: ", index);
    }
    return re;
  } else {
    throw new Error("必须传入一个有效字符串");
  }
}

console.log(parse(jsonText));
