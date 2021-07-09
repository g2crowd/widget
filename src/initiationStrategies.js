// @format

export default function (strategies = {}) {
  return {
    add(name, strategy) {
      strategies[name] = strategy;
    },

    get(name) {
      return strategies[name];
    }
  };
}
