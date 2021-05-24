// 语法树解析 实现两个版本  parseHTML  parseJSX  parseJS  这是一个长期任务

// 结果一个对象{tagName, attrs, children, value}
function parseHTML(htmlString) {
  const needSkip = [" ", "\n", '"', "'"];
  const needSkipObj = {};
  needSkip.forEach((key) => {
    needSkipObj[key] = true;
  });
  function skipIndex(str, index) {
    while (str[index] in needSkipObj) {
      index++;
    }
    return index;
  }

  // 解析入口
  function startParse(str, index) {
    index = skipIndex(str, index);
    let stack = [];
    console.log(stack);
    while (index < str.length) {
      const { tagName, isSingleTag, isEndTag, tagEndIndex, attrs, value } =
        parseTag(str, index);
      if (isSingleTag) {
        // 单标签
        if (stack.length === 0) {
          return { tagName, attrs, value };
        } else {
          // 拿到栈顶元素
          const popStackItem = stack[stack.length - 1];
          if (!popStackItem.children) {
            popStackItem.children = [];
          }
          popStackItem.children.push({ tagName, attrs, value });
        }
      } else {
        if (isEndTag) {
          // 如果是结束标签
          // 拿到栈顶元素
          if (stack.length) {
            const popStackItem = stack.pop();
            if (popStackItem.tagName !== tagName) {
              throw new Error(
                `解析错误，开始标签${popStackItem.tagName}与结束标签${tagName}不匹配`
              );
            } else {
              if (popStackItem.isEndTag) {
                throw new Error(`解析错误，相同的结束标签${tagName}`);
              } else {
                // 此时是同一个标签的结束标签，可以进行合并
                if (stack.length) {
                  // 如果栈中还有
                  const parentElement = stack[stack.length - 1];
                  if (!parentElement.children) {
                    parentElement.children = [];
                  }
                  parentElement.children.push({
                    tagName: popStackItem.tagName,
                    attrs: popStackItem.attrs,
                    children: popStackItem.children,
                    value: popStackItem.value,
                  });
                } else {
                  // 如果栈中没有了其他元素
                  return {
                    tagName: popStackItem.tagName,
                    attrs: popStackItem.attrs,
                    children: popStackItem.children,
                    value: popStackItem.value,
                  };
                }
              }
            }
          } else {
            throw new Error(`解析错误，结束标签${tagName}不存在开始标签`);
          }
        } else {
          // 如果不是结束标签
          // 则需要将当前标签放入栈顶
          stack.push({ tagName, attrs, value });
        }
      }
      index = tagEndIndex;
    }
  }

  function parseTag(str, index) {
    index = skipIndex(str, index);
    if (str[index] === "/" || str[index] === ">") {
      index++;
      index = skipIndex(str, index);
    }
    if (str[index] === "<") {
      index++;
      const { tagName, isEndTag, tagNameEndIndex } = parseTagName(str, index);
      if (isEndTag) {
        return { tagName, tagEndIndex: tagNameEndIndex, isEndTag };
      } else {
        const { attrs, isSingleTag, attrsEndIndex } = parseAttrs(
          str,
          tagNameEndIndex
        );
        if (isSingleTag) {
          return { tagName, attrs, isSingleTag, tagEndIndex: attrsEndIndex };
        } else {
          const { value, valueEndIndex } = parseValue(str, attrsEndIndex);
          return { tagName, value, attrs, tagEndIndex: valueEndIndex };
        }
      }
    } else {
      return null;
    }
  }

  function parseTagName(str, index) {
    index = skipIndex(str, index);
    let re = "";
    let isEndTag = false;
    for (let i = index; i < str.length; i++) {
      if (str[i] === "/" && re === "") {
        // 结束标签
        isEndTag = true;
      } else if (str[i] === ">" || str[i] === " " || str[i] === "/") {
        i = skipIndex(str, i);
        return { tagName: re, tagNameEndIndex: i, isEndTag };
      } else {
        re += str[i];
      }
    }
  }

  function parseAttrs(str, index) {
    // 如果与到了结束标签
    index = skipIndex(str, index);
    const attrs = {};
    if (str[index] === "/") {
      // 当前是单标签
      return {
        attrs,
        isSingleTag: true,
        attrsEndIndex: skipIndex(str, index + 1) + 1,
      };
    }
    if (str[index] === ">") {
      // 没有额外属性
      return { attrs, isSingleTag: false, attrsEndIndex: index + 1 };
    }
    // 说明有属性
    const flag1 = str.indexOf("/", index);
    const flag2 = str.indexOf(">", index);
    const attrsStr = str.slice(index, Math.min(flag1, flag2));
    const attrsArr = attrsStr.split(" ");
    for (let i = 0; i < attrsArr.length; i++) {
      if (attrsArr[i].length) {
        let tempIndex = attrsArr[i].indexOf("=");
        if (tempIndex !== -1) {
          let key = attrsArr[i].slice(0, tempIndex);
          let value = attrsArr[i].slice(tempIndex + 1);
          attrs[key] = value;
        } else {
          // 说明是直接写的属性名
          attrs[attrsArr[i]] = true;
        }
      }
    }
    if (flag1 < flag2) {
      return { attrs, isSingleTag: true, attrsEndIndex: flag2 + 1 };
    } else {
      return { attrs, isSingleTag: false, attrsEndIndex: flag2 + 1 };
    }
  }

  function parseValue(str, index) {
    index = skipIndex(str, index);
    let value = "";
    while (str[index] !== "<") {
      if (str[index] === ">" || str[index === " "]) {
        continue;
      } else {
        value += str[index];
      }
      index++;
    }
    return { value, valueEndIndex: index };
  }

  try {
    return startParse(htmlString.trim(), 0);
  } catch (e) {}
}
