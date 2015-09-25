function StackUnderflowError() { }
StackUnderflowError.prototype = new Error("Stack underflow");

function EndOfInputError() { }
EndOfInputError.prototype = new Error("nextToken called with no more tokens");

function MissingWordError(word) {
  this.message = " " + word + " ? ";
}


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
        throw new StackUnderflowError();
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
  var definitionStart = /^\s*:/;
  var definitionEnd = /;\s*$/;

  function hasMore() {
    // Is there any non-whitespace remaining in the input?
    return !!input.slice(index).match(validToken);
  }

  function isDefinitionStart() {
    return input.match(definitionStart);
  }

  function isDefinitionEnd() {
    return input.match(definitionEnd);
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
      throw new EndOfInputError();
    }

    return token;
  }

  return {
    hasMore: hasMore,
    nextToken: nextToken,
    isDefinitionStart: isDefinitionStart,
    isDefinitionEnd: isDefinitionEnd
  };
}

function Definition(name, dictionary) {
  var toExecute = [];

  // Copied
  function isNumber(val) {
    return +val + "" === val;
  }

  // Copied
  function invalidWord(word) {
    if (word !== ";") { // Can safely skip ;
      throw new MissingWordError(word);
    }
  }

  // Copied
  function getString(output) {
    if (output === undefined) {
      return "";
    } else {
      return "" + output;
    }
  }


  // This is currently copied from Forth so don't do that
  function addWord(word) {
    var definition = dictionary.lookup(word);

    if (definition !== null) {
      toExecute.push(function (stack, dictionary) {
        getString(definition(stack, dictionary));
      });
    } else if (isNumber(word)) {
      toExecute.push(function (stack, dictionary) {
        stack.push(+word);
      });
    } else {
      invalidWord(word);
    }
  }

  function compile() {
    dictionary.add(name, function (stack, dictionary) {
      toExecute.forEach(function (action) {
        action(stack, dictionary);
      });
    });
  }

  return {
    addWord: addWord,
    compile: compile
  };
}

function Forth() {
  var inDefinition = false;
  var currentDefinition = null;
  var stack = Stack();
  var dictionary = Dictionary();

  function startDefinition() {
    inDefinition = true;
  }

  function endDefinition() {
    inDefinition = false;
  }

  function isNumber(val) {
    return +val + "" === val;
  }

  function invalidWord(word) {
    if (word !== ";") { // Can safely skip ;
      throw new MissingWordError(word);
    }
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
    var tokenizer = Tokenizer(line);

    if (tokenizer.isDefinitionStart()) {
      startDefinition();
      tokenizer.nextToken(); // drop :
      var definitionName = tokenizer.nextToken();
      currentDefinition = new Definition(definitionName, dictionary);
    }

    if (inDefinition) {
      var output = "";

      while (tokenizer.hasMore()) {
        try {
          currentDefinition.addWord(tokenizer.nextToken());
        } catch (e) {
          if (e instanceof EndOfInputError || e instanceof MissingWordError) {
            endDefinition();
            currentDefinition = null;
            return e.message;
          } else {
            throw e;
          }
        }
      }

      if (tokenizer.isDefinitionEnd()) {
        endDefinition();
        currentDefinition.compile();
        return " ok";
      }
    } else {
      var output = "";

      while (tokenizer.hasMore()) {
        try {
          output += processWord(tokenizer.nextToken());
        } catch (e) {
          if (e instanceof EndOfInputError || e instanceof MissingWordError) {
            return e.message;
          } else {
            throw e;
          }
        }
      }

      // This will return something different if invalidWord throws error
      return " " + output + " ok";
    }
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
