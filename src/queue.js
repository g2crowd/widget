// @format

function queue() {
  let list = [];
  let completed = null;

  function flush() {
    list.forEach((i) => i());
    list = [];
  }

  return {
    add(item) {
      list.push(item);
    },

    flush() {
      if (completed === null) {
        completed = new Promise(function (resolve) {
          window.setTimeout(function () {
            flush();
            completed = null;
            resolve();
          }, 0);
        });
      }

      return completed;
    },

    size() {
      return list.length;
    }
  };
}

export default queue;
