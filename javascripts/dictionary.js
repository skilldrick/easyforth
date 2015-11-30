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
    
    var item;
    for (var i = 0; i < dict.length; i++) {
      item = dict[i];
      if (item[0] === key) {
        return item[1];
      }
    }
    return null;
  }

  return {
    add: add,
    lookup: lookup
  };
}
