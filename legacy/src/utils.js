export * from "../../dom/src/utils.js";

/**
 * createArray
 *
 * @param  {...any} items items to spread into a new array
 * @example
 *
    // methods
    const nums = createArray(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    nums.get(1), // 2
    nums.add(11), // 11
    nums.remove(5), // [6]
    nums.entries(), // [1,2,3,4,5,6,7,8,9,10,11]
    nums.clear(), // true
    nums.entries() // []

    // iterate
    const arr = createArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    for (const item of arr) {
        console.log(item);
    }
 */
export function createArray(...items) {
  const arr = [...items];
  let count = 0;
  const prototype = {
    get(index) {
      return arr[index];
    },
    first() {
      return prototype.get(0);
    },
    last() {
      console.log("createArrray", { count });
      return prototype.get(arr.length - 1);
    },
    add(item) {
      return arr.push(item);
    },
    remove(index) {
      return arr.splice(index, 1);
    },
    clone() {
      return [...arr];
    },
    entries() {
      return arr;
    },
    clear() {
      if (arr.length > 0) {
        arr.length = 0;
        count = 0;
        return true;
      }

      return false;
    },
    *[Symbol.iterator]() {
      yield prototype.get(count);
      count++;
    },
    get [Symbol.toStringTag]() {
      return "array++";
    },
  };
  return prototype;
}
