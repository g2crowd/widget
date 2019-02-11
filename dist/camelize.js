"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

require("core-js/modules/es6.regexp.replace");

// @format
function _default(str) {
  return str.replace(/[-_]([\S])/g, function (dash, letter) {
    return letter.toUpperCase();
  });
}