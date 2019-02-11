"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initiationStrategies = initiationStrategies;

require("core-js/modules/es6.function.name");

// @format
function initiationStrategies() {
  var strategies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    add: function add(name, strategy) {
      strategies[name] = strategy;
    },
    get: function get(name) {
      return strategies[name];
    }
  };
}