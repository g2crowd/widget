// @format

export default function (str) {
  return str.replace(/[-_]([\S])/g, function (dash, letter) {
    return letter.toUpperCase();
  });
}
