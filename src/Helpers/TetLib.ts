// eslint-disable-next-line no-unused-vars
export type Full<T> = {
  [P in keyof T]-?: T[P];
};
export const TetLib = {
  sleep: (delay: number | undefined) =>
    new Promise((resolve) => setTimeout(resolve, delay)),
  text_truncate: (str: string, len: number) => {
    let array = str.split("");
    array.length = len - 3;
    return array.join("") + "...";
  },
  SecsToFormat: (string: string) => {
    let sec_num = parseInt(string, 10);
    let hours = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - hours * 3600) / 60);
    let seconds = sec_num - hours * 3600 - minutes * 60;
    let strHrs = `${hours < 10 ? "0" : ""}${hours}`;
    let strMins = `${minutes < 10 ? "0" : ""}${minutes}`;
    let strSecs = `${seconds < 10 ? "0" : ""}${seconds}`;
    return `${strHrs}:${strMins}:${strSecs}`;
  },
  genID: (length: number) => {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  /**
   *
   * @param {Array<*>} array
   * @param {Number} length
   * @returns {Array<Array<*>>}
   */
  splitArrayIntoChunks: (array: any[], length: number) => {
    let res = [];
    while (array.length >= length) {
      res.push(array.splice(0, length));
    }
    if (array.length) res.push(array);
    return res;
  },
  /**
   * Shuffles array in-place;
   * @param {Array<*>} array
   * @returns {Array<*>}
   */
  shuffle: (array: string | any[]) => {
    let counter = array.length;
    while (counter > 0) {
      let index = Math.floor(Math.random() * counter);
      counter--;
      let temp = array[counter];
      //@ts-expect-error
      [array[counter], array[index]] = [array[index], array[counter]];
    }
    return array;
  },
  /**
   * Converts large number to a prefixed number (eg: 1435839 => 1.43m)
   * @param {Number} num
   * @returns {String}
   */
  formatNumber(num: number) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(3).replace(/\.0$/, "") + "b";
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(3).replace(/\.0$/, "") + "m";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(3).replace(/\.0$/, "") + "k";
    }
    return num;
  },
};
export default TetLib;
