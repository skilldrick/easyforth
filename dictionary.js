function Dictionary() {
  // The dict is searched from beginning to end, so new definitions
  // need to be unshifted. This is usually a linked list, but meh
  var dict = [];

  function add(name, definition) {
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
