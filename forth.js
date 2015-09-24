function Stack() {
  var arr = [];

  return {
    push: function (item) {
      arr.push(item);
    },
    pop: function () {
      if (arr.length > 0) {
        return arr.pop();
      } else {
        throw new Error("Stack underflow");
      }
    },
    print: function () {
      return arr.join(" ") + " <- Top ";
    }
  };
}

function Dictionary() {
  // The dict is searched from beginning to end, so new definitions
  // need to be unshifted. This is usually a linked list, but meh
  var dict = [];

  function add(word, definition) {
    dict.unshift([word, definition]);
  }

  add(".",  function (stack, dictionary) {
    return stack.pop();
  });
  add(".s", function (stack, dictionary) {
    return "\n" + stack.print();
  });
  add("+", function (stack, dictionary) {
    stack.push(stack.pop() + stack.pop());
  });
  add("cr", function (stack, dictionary) {
    return "\n";
  });
  add("emit", function (stack, dictionary) {
    return String.fromCharCode(stack.pop());
  });

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

function Forth() {
  var stack = Stack();
  var dictionary = Dictionary();

  function isNumber(val) {
    return +val + "" === val;
  }

  function invalidWord(word) {
    return word + " ? "
  }

  // Convert value to string, but undefined to ""
  function getString(output) {
    if (output === undefined) {
      return "";
    } else {
      return "" + output;
    }
  }

  function processWord(word) {
    var definition = dictionary.lookup(word);

    if (definition !== null) {
      return getString(definition(stack, dictionary));
    } else if (isNumber(word)) {
      stack.push(+word);
    } else {
      invalidWord(word);
    }

    return "";
  }

  function readLine(line) {
    var words = line.split(/\s+/);
    var output = "";

    words.forEach(function (word) {
      output += processWord(word)
    });

    // This will return something different if invalidWord throws error
    return " " + output + " ok";
  }

  return {
    readLine: readLine,
    getStack: function () {
      return stack.print();
    }
  };
}
