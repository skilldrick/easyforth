function Dictionary() {
  var dict = [];

  function add(name, definition) {
    // The dict is searched from beginning to end, so new definitions
    // need to be unshifted.
    dict.unshift([name.toLowerCase(), definition]);
  }

  // Missing key returns null
  function lookup(key) {
    key = key.toLowerCase();
    var item = dict.find(function (item) {
      return item[0] === key;
    });

    if (item === undefined) {
      return null;
    } else {
      return item[1];
    }
  }

  return {
    add: add,
    lookup: lookup
  };
}
