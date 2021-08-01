// 实现不同排序
Number.prototype[Symbol.iterator] = function* () {
  const last = this.valueOf();
  let i = 0;
  while (i < last) {
    yield i++;
  }
};

const random = (array) => array.sort(() => (Math.random() > 0.5 ? -1 : 1));

const swap = (arr, i, j) => {
  let temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

// 选择法排序
const XZSort = (arr, judge = (a, b) => a - b) => {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (judge(arr[i], arr[j]) > 0) {
        swap(arr, i, j);
      }
    }
  }
};

// 冒泡法排序
const MPSort = (arr, judge = (a, b) => a - b) => {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (judge(arr[j], arr[j + 1]) > 0) {
        swap(arr, j, j + 1);
      }
    }
  }
};

// 插入法排序
const CRSort = (arr, judge = (a, b) => a - b) => {
  for (let j = 1; j < arr.length; j++) {
    let t = j - 1;
    while (t >= 0 && judge(arr[t], arr[t + 1]) > 0) {
      swap(arr, t, t + 1);
      t--;
    }
  }
};

// 希尔排序
const XESort = (arr, judge = (a, b) => a - b) => {
  // 获取隔板宽度
  let n = 1;
  while ((n <= arr.length / 3) | 0) {
    n = n * 3 + 1;
  }
  for (let len = n; len > 0; len = (len - 1) / 3) {
    for (let i = len; i < arr.length; i++) {
      let j = i - len;
      while (j >= 0 && judge(arr[j], arr[j + len]) > 0) {
        swap(arr, j, j + len);
        j -= len;
      }
    }
  }
};

// 归并排序
const GBSort = (arr, judge = (a, b) => a - b) => {
  if (arr.length <= 1) {
    return arr;
  }
  const midIndex = (arr.length / 2) | 0;
  let leftArr = arr.slice(0, midIndex);
  let rightArr = arr.slice(midIndex);
  leftArr = GBSort(leftArr, judge);
  rightArr = GBSort(rightArr, judge);
  let i = 0;
  let j = 0;
  let re = [];
  while (i < leftArr.length && j < rightArr.length) {
    if (judge(leftArr[i], rightArr[j]) > 0) {
      re.push(rightArr[j++]);
    } else {
      re.push(leftArr[j++]);
    }
  }
  while (i < leftArr.length) {
    re.push(leftArr[i++]);
  }
  while (j < rightArr.length) {
    re.push(rightArr[j++]);
  }
  return re;
};

// 快排序

const QuickSort = (arr, start, end, judge = (a, b) => a - b) => {
  if (end - start < 1) {
    return;
  }
  let randomIndex = (((end - start) * Math.random()) | 0) + start;
  swap(arr, end, randomIndex);
  let i = start;
  for (let j = start; j < end; j++) {
    if (judge(arr[j], arr[end]) > 0) {
      swap(arr, i++, j);
    }
  }
  swap(arr, i, end);
  QuickSort(arr, 0, i - 1, judge);
  QuickSort(arr, i + 1, end, judge);
};
