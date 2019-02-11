// @format

function initiationStrategies(strategies = {}) {
  return {
    add(name, strategy) {
      strategies[name] = strategy;
    },

    get(name) {
      return strategies[name];
    },
  };
}

export { initiationStrategies };
