function compile(dictionary, toCompile) {
  function Conditional(parentContext, parentConditional) {
    this.parentContext = parentContext;
    this.parentConditional = parentConditional;
    this.consequent = [];
    this.alternative = [];
  }

  function compileConditionals(toCompile) {
    var compiledToExecute = [];
    var currentContext = compiledToExecute;
    var currentConditional = null;

    toCompile.forEach(function (action) {
      if (action.isControlCode) {
        switch (action.code) {
          case "if":
            currentConditional = new Conditional(currentContext, currentConditional);
            currentContext.push(currentConditional);
            // context is conditional consequent now
            currentContext = currentConditional.consequent;
            break;
          case "else":
            // context is conditional alternative now
            currentContext = currentConditional.alternative;
            break;
          case "then":
            // context is parent context now
            currentContext = currentConditional.parentContext;
            currentConditional = currentConditional.parentConditional;
            break;
            /*
          case "do":
            break;
          case "loop":
            break;
            */
        }

      } else {
        currentContext.push(action);
      }
    });

    return compiledToExecute;
  }

  function execute(toExecute, stack, dictionary) {
    var output = "";

    toExecute.forEach(function (action) {
      if (action instanceof Conditional) {
        if (stack.pop() !== FALSE) {
          output += execute(action.consequent, stack, dictionary);
        } else {
          output += execute(action.alternative, stack, dictionary);
        }
      } else {
        var result = action(stack, dictionary);
        output += getString(result);
      }
    });

    return output;
  }

  return function (stack, dictionary) {
    var toExecute = compileConditionals(toCompile);
    return execute(toExecute, stack, dictionary);
  };
}

function Definition(name, dictionary) {
  var toCompile = [];

  // This is currently copied from Forth so don't do that
  function addWord(token) {
    var definition = dictionary.lookup(token.token);
    var word = token.token;

    if (definition !== null) {
      toCompile.push(definition);
    } else if (isNumber(word)) {
      toCompile.push(function (stack, dictionary) {
        stack.push(+word);
      });
    } else if (token.string) {
      toCompile.push(function (stack, dictionary) {
        return word;
      });
    } else {
      invalidWord(word);
    }
  }

  function addToDictionary() {
    dictionary.add(name, compile(dictionary, toCompile));
  }

  return {
    addWord: addWord,
    addToDictionary: addToDictionary
  };
}
