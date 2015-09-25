function StackUnderflowError() {
  this.message = "Stack underflow";
}

function EndOfInputError() {
  this.message = "nextToken called with no more tokens";
}

function MissingWordError(word) {
  this.message = word + " ? ";
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
    dict.unshift([word.toLowerCase(), definition]);
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
  var stringMode = false;
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

  function skipWhitespace() {
    // Skip over leading whitespace
    while (whitespace.test(input[index]) && index < length) {
      index++;
    }
  }

  function nextToken() {
    skipWhitespace();
    var isString = input[index] === '.' && input[index + 1] === '"';

    var token = "";
    if (isString) {
      index += 3; // skip over ." and space
      while (input[index] !== '"' && index < length) {
        token += input[index];
        index++;
      }
      index++; // skip over final "
    } else {
      while (validToken.test(input[index]) && index < length) {
        token += input[index];
        index++;
      }
    }

    if (!token) {
      throw new EndOfInputError();
    }

    var returnObject = {
      token: token,
      string: isString
    };

    return returnObject;
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

  // This is currently copied from Forth so don't do that
  function addWord(token) {
    var definition = dictionary.lookup(token.token);
    var word = token.token;

    if (definition !== null) {
      toExecute.push(function (stack, dictionary) {
        return definition(stack, dictionary);
      });
    } else if (isNumber(word)) {
      toExecute.push(function (stack, dictionary) {
        stack.push(+word);
      });
    } else if (token.string) {
      toExecute.push(function (stack, dictionary) {
        return word;
      });
    } else {
      invalidWord(word);
    }
  }

  function compile() {
    dictionary.add(name, function (stack, dictionary) {
      var output = "";
      toExecute.forEach(function (action) {
        output += getString(action(stack, dictionary));
      });
      return output;
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

  function processWord(token) {
    if (token.string) {
      return "";
    }

    var word = token.token;

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
      var definitionName = tokenizer.nextToken().token;
      currentDefinition = new Definition(definitionName, dictionary);
    }

    // The duplication between this case and the other is pretty bad
    if (inDefinition) {
      while (tokenizer.hasMore()) {
        try {
          currentDefinition.addWord(tokenizer.nextToken());
        } catch (e) {
          if (e instanceof EndOfInputError || e instanceof MissingWordError) {
            endDefinition();
            currentDefinition = null;
            return " " + e.message;
          } else {
            throw e;
          }
        }
      }

      if (tokenizer.isDefinitionEnd()) {
        endDefinition();
        currentDefinition.compile();
        return "  ok";
      }
    } else {
      var output = "";

      while (tokenizer.hasMore()) {
        try {
          output += processWord(tokenizer.nextToken());
        } catch (e) {
          if (e instanceof EndOfInputError || e instanceof MissingWordError || e instanceof StackUnderflowError) {
            return " " + e.message;
          } else {
            throw e;
          }
        }
      }

      return " " + output + " ok";
    }

    return "";
  }


  dictionary.add(".",  function (stack, dictionary) {
    return stack.pop() + " ";
  });
  dictionary.add(".s", function (stack, dictionary) {
    return "\n" + stack.print();
  });
  dictionary.add("+", function (stack, dictionary) {
    stack.push(stack.pop() + stack.pop());
  });
  dictionary.add("emit", function (stack, dictionary) {
    return String.fromCharCode(stack.pop());
  });
  readLine(": cr 10 emit ;");
  readLine(": space 32 emit ;");
  // can implement this as a readLine when we have loops
  dictionary.add("spaces", function (stack, dictionary) {
    return new Array(stack.pop() + 1).join(" ");
  });

  return {
    readLine: readLine,
    getStack: function () {
      return stack.print();
    }
  };
}
