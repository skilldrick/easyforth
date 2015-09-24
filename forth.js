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

function Tokenizer(input) {
  var index = 0;
  var length = input.length;
  var whitespace = /\s+/;
  var validToken = /\S+/;

  function hasMore() {
    // Is there any non-whitespace remaining in the input?
    return !!input.slice(index).match(validToken);
  }

  function nextToken() {
    // Skip over leading whitespace
    while (whitespace.test(input[index]) && index < length) {
      index++;
    }

    // Collect valid token characters in a string
    var token = "";
    while (validToken.test(input[index]) && index < length) {
      token += input[index];
      index++;
    }

    if (!token) {
      throw new Error("nextToken called with no more tokens");
    }

    return token;
  }

  return {
    hasMore: hasMore,
    nextToken: nextToken
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

  // This is wrong (naive and uses late binding of names) but will do for now...
  function compile(words) {
    words.pop(); // remove ;

    dictionary.add(words.shift(), function () {
      words.forEach(function (word) {
        processWord(word)
      });
    });
  }

  // This could be cleaned up a lot
  function readLine(line) {
    var tokenizer = Tokenizer(line);

    //TODO: reimplement this using tokenizer
    /*
    if (words[0] === ":") {
      compile(words.slice(1));
      return " ok";
    }
    */

    var output = "";

    while(tokenizer.hasMore()) {
      output += processWord(tokenizer.nextToken());
    }

    // This will return something different if invalidWord throws error
    return " " + output + " ok";
  }


  dictionary.add(".",  function (stack, dictionary) {
    return stack.pop();
  });
  dictionary.add(".s", function (stack, dictionary) {
    return "\n" + stack.print();
  });
  dictionary.add("+", function (stack, dictionary) {
    stack.push(stack.pop() + stack.pop());
  });
  dictionary.add("cr", function (stack, dictionary) {
    return "\n";
  });
  dictionary.add("emit", function (stack, dictionary) {
    return String.fromCharCode(stack.pop());
  });

  return {
    readLine: readLine,
    getStack: function () {
      return stack.print();
    }
  };
}
