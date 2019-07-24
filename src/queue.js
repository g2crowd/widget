// @format

function queue() {
  let list = [];
  let completed = null;

  function flush() {
    list.forEach(i => i());
    list = [];
  }

  const me = {
    add(item) {
      list.push(item);
    },

    flush() {
      if (!completed) {
        completed = new Promise(function (resolve) {
          window.setTimeout(function () {
            flush();
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

  return me;
}

export default queue;
