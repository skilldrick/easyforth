'use strict';

var FALSE = 0;
var TRUE = -1;

function Forth() {
  // Core structures
  var context = {
    stack: Stack('Argument Stack'),
    returnStack: Stack('Return Stack'),
    dictionary: Dictionary(),
    memory: Memory()
  };

  function MissingWordError(word) {
    this.message = word + " ? ";
  }

  // Convert token into an action that executes that token's behavior
  function tokenToAction(token) {
    var word = token.value;
    var definition = context.dictionary.lookup(word);

    if (token.isStringLiteral) {
      return function (context) {
        return word;
      };
    } else if (definition !== null) {
      return definition;
    } else if (isFinite(word)) {
      return function (context) {
        context.stack.push(+word);
      };
    } else {
      throw new MissingWordError(word);
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
      return function (context) {
        return getString(action(context));
      };
    }
  }

  // iterate through tokens, converting to action function
  function eachTokenAsAction(tokenizer, callback) {
    var nextToken;
    while (nextToken = tokenizer.nextToken()) {
      var action = tokenToAction(nextToken)
      callback(makeActionReturnString(action));
    }
  }

  // compile actions into definition and add definition to dictionary
  function compileAndAddToDictionary(name, actions) {
    var definition = compile(context.dictionary, actions);
    context.dictionary.add(name, definition);
  }

  // Throw if error is not of one of these types
  function throwIfNotOneOf(e, errorTypes) {
    var shouldHandle = errorTypes.some(function (errorType) {
      return e instanceof errorType;
    });

    if (!shouldHandle) {
      throw e;
    }
  }

  function createVariable(name) {
    var pointer = context.memory.addVariable(name);
    context.dictionary.add(name, function (context) {
      context.stack.push(pointer);
    });
  }

  function createConstant(name, value) {
    context.dictionary.add(name, function (context) {
      context.stack.push(value);
    });
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

    // TODO: make separate functions for the compile-time and interpret-time bits
    // Ideally we'd be able to jump between compile-time and interpret time based on : and ;
    if (currentDefinition) {
      try {
        eachTokenAsAction(tokenizer, function (action) {
          // Add action to list of actions in current definition
          currentDefinition.actions.push(action);
        });

        // If this line is the end of the definition (it includes ;) compile
        // the current definition and add it to the dictionary
        if (tokenizer.isDefinitionEnd()) {
          compileAndAddToDictionary(currentDefinition.name, currentDefinition.actions);
          currentDefinition = null;
          return "  ok";
        }
      } catch (e) {
        throwIfNotOneOf(e, [MissingWordError, UnbalancedControlStructureError]);
        currentDefinition = null;
        return " " + e.message;
      }
    } else { // not in definition, i.e. interactive mode
      var output = "";

      try {
        eachTokenAsAction(tokenizer, function (action) {
          if (action.code === "variable") {
            createVariable(tokenizer.nextToken().value);
          } else if (action.code === "constant") {
            createConstant(tokenizer.nextToken().value, stack.pop());
          } else {
            // Execute action and append output
            output += action(context);
          }
        });
      } catch (e) {
        throwIfNotOneOf(e, [MissingWordError, StackUnderflowError]);
        return " " + e.message;
      }

      return " " + output + " ok";
    }
  }

  addPredefinedWords(context.dictionary, readLine);

  return {
    readLine: readLine,
    getStack: function () {
      return context.stack.print();
    }
  };
}
