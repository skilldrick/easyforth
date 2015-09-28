'use strict';

function Forth() {
  // Core structures
  var stack = Stack('Argument Stack');
  var returnStack = Stack('Return Stack');
  var dictionary = Dictionary();

  // Convert token into an action that executes that token's behavior
  function tokenToAction(token) {
    function isNumber(val) {
      return +val + "" === val;
    }

    function invalidWord(word) {
      if (word !== ";") { // Can safely skip ;
        throw new MissingWordError(word);
      }
    }

    var word = token.value;
    var definition = dictionary.lookup(word);

    if (token.isStringLiteral) {
      return function (stack, dictionary, returnStack) {
        return word;
      };
    } else if (definition !== null) {
      return definition;
    } else if (isNumber(word)) {
      return function (stack, dictionary, returnStack) {
        stack.push(+word);
      };
    } else {
      invalidWord(word);
    }

    return function () {
      return "";
    };
  }

  // Convert value to string, but undefined to ""
  function getString(output) {
    if (output === undefined) {
      return "";
    } else {
      return "" + output;
    }
  }

  function makeActionReturnString(action) {
    if (action.isControlCode) {
      // control codes are not functions
      return action;
    } else {
      // If an action returns undefined, make it return a string instead
      return function (stack, dictionary, returnStack) {
        return getString(action(stack, dictionary, returnStack));
      };
    }
  }

  // iterate through tokens, converting to action function
  function eachTokenAsAction(tokenizer, callback) {
    while (tokenizer.hasMore()) {
      var action = tokenToAction(tokenizer.nextToken())
      callback(makeActionReturnString(action));
    }
  }

  // compile actions into definition and add definition to dictionary
  function compileAndAddToDictionary(name, actions) {
    var definition = compile(dictionary, actions);
    dictionary.add(name, definition);
  }

  // Throw if error is not of one of these types
  function throwIfNot(e, errorTypes) {
    var shouldHandle = errorTypes.some(function (errorType) {
      return e instanceof errorType;
    });

    if (!shouldHandle) {
      throw e;
    }
  }

  // This variable is shared across multiple calls to readLine,
  // as definitions can span multiple lines
  var currentDefinition = null;

  // Read a line of input. Return value is output for this line.
  function readLine(line) {
    var tokenizer = Tokenizer(line);

    if (tokenizer.isDefinitionStart()) {
      tokenizer.nextToken(); // drop :
      var definitionName = tokenizer.nextToken().value;
      currentDefinition = { name: definitionName, actions: [] };
    }

    if (currentDefinition) {
      try {
        eachTokenAsAction(tokenizer, function (action) {
          // Add action to list of actions in current definition
          currentDefinition.actions.push(action);
        });
      } catch (e) {
        throwIfNot(e, [EndOfInputError, MissingWordError]);
        currentDefinition = null;
        return " " + e.message;
      }

      // If this line is the end of the definition (it includes ;) compile
      // the current definition and add it to the dictionary
      if (tokenizer.isDefinitionEnd()) {
        compileAndAddToDictionary(currentDefinition.name, currentDefinition.actions);
        currentDefinition = null;
        return "  ok";
      }
    } else { // not in definition, i.e. interactive mode
      var output = "";

      try {
        eachTokenAsAction(tokenizer, function (action) {
          // Execute action and append output
          output += action(stack, dictionary, returnStack);
        });
      } catch (e) {
        throwIfNot(e, [EndOfInputError, MissingWordError, StackUnderflowError]);
        return " " + e.message;
      }

      return " " + output + " ok";
    }
  }

  addPredefinedWords(dictionary, readLine);

  return {
    readLine: readLine,
    getStack: function () {
      return stack.print();
    }
  };
}
