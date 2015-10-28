'use strict';

var FALSE = 0;
var TRUE = -1;

function Forth() {
  // Core structures
  var context = {
    stack: Stack('Argument Stack'),
    returnStack: Stack('Return Stack'),
    dictionary: Dictionary(),
    memory: Memory(),
    // This is set when the interpreter is waiting for a key to be pressed
    waitingForKey: false,
    // This is set within readLine as a callback to continue processing tokens
    // once a key has been pressed
    afterKeyInputCallback: null
  };

  // This variable is shared across multiple calls to readLine,
  // as definitions can span multiple lines
  var currentDefinition = null;

  function MissingWordError(word) {
    this.message = word + " ? ";
  }

  function namedFunction(name, func) {
    func._name = name;
    return func;
  }

  // Convert token into an action that executes that token's behavior
  function tokenToAction(token) {
    var word = token.value;
    var definition = context.dictionary.lookup(word);

    if (token.isStringLiteral) {
      return namedFunction("String: " + word, function (context) {
        return word;
      });
    } else if (definition !== null) {
      return definition;
    } else if (isFinite(word)) {
      return namedFunction("Number: " + word, function (context) {
        context.stack.push(+word);
      });
    } else {
      throw new MissingWordError(word);
    }

    return function () {
      return "";
    };
  }

  function addToDictionary(name, definition) {
    context.dictionary.add(name, namedFunction(name, definition));
  }

  // compile actions into definition and add definition to dictionary
  function compileAndAddToDictionary(name, actions) {
    var definition = compile(context.dictionary, actions);
    addToDictionary(name, definition);
  }

  function createVariable(name) {
    var pointer = context.memory.addVariable(name);
    addToDictionary(name, function (context) {
      context.stack.push(pointer);
    });
  }

  function createConstant(name, value) {
    addToDictionary(name, function (context) {
      context.stack.push(value);
    });
  }

  function startDefinition(name) {
    currentDefinition = { name: name, actions: [] };
  }

  function endDefinition() {
    compileAndAddToDictionary(currentDefinition.name, currentDefinition.actions);
    currentDefinition = null;
  }

  function addActionToCurrentDefinition(action) {
    if (action.code === ";") {
      endDefinition();
    } else {
      currentDefinition.actions.push(action);
    }
  }

  function executeRuntimeAction(tokenizer, action) {
    switch (action.code) {
    case "variable":
      createVariable(tokenizer.nextToken().value);
      break;
    case "constant":
      createConstant(tokenizer.nextToken().value, context.stack.pop());
      break;
    case ":":
      startDefinition(tokenizer.nextToken().value);
      break;
    default:
      var result = action(context);
      if (result instanceof Promise) {
        return result;
      } else {
        return Promise.resolve(result);
      }
    }

    return Promise.resolve("");
  }

  // Read a line of input. Callback is called with output for this line.
  function readLine(line, outputCallback) {
    return new Promise(function (resolve, reject) {
      context.addOutput = outputCallback || function () {};
      var tokenizer = Tokenizer(line);

      // processNextToken recursively executes tokens
      function processNextToken() {
        var nextToken = tokenizer.nextToken();

        if (!nextToken) { // reached end of line
          if (!currentDefinition) { // don't append output while definition is in progress
            context.addOutput(" ok");
          }
          resolve();
          return;
        }

        var action = tokenToAction(nextToken)

        if (currentDefinition) { // Are we currently defining a definition?
          addActionToCurrentDefinition(action);
          processTokens();
        } else {

          executeRuntimeAction(tokenizer, action).then(function (output) {
            context.addOutput(output);

            if (context.waitingForKey && !context.afterKeyInputCallback) {
              context.afterKeyInputCallback = processTokens;
            } else {
              processTokens();
            }
          });
        }
      }

      function processTokens() {
        try {
          processNextToken();
        } catch (e) {
          currentDefinition = null;
          context.addOutput(" " + e.message);
          resolve();
        }
      }

      processTokens();
    });
  }

  // Takes an array of nullary functions that return promises and executes them in series,
  // collecting the output from each, and finally resolving with the combined output
  function executeInSequence(promiseFunctions, outputCallback) {
    var output = [];

    // Takes a promise and returns a promise that collects the output of the original
    // promise. New promise resolves with joined output.
    function addOutput(promise) {
      return promise.then(function (o) {
        // TODO: will need outputCallback later probably :P
        outputCallback && outputCallback(o);
        output.push(o);
        return output.join("");
      });
    }

    return promiseFunctions.reduce(function (promise, promiseFunction) {
      return promise.then(function () {
        return addOutput(promiseFunction());
      });
    }, Promise.resolve());
  }

  function readLines(codeLines, callbacks) {
    var promiseFunctions = codeLines.map(function (codeLine) {
      return function () {
        callbacks && callbacks.lineCallback(codeLine);
        return readLine(codeLine, callbacks && callbacks.outputCallback);
      };
    });

    return executeInSequence(promiseFunctions); // defined in shared.js
  }

  // because readLines is async, addPredefinedWords is async too
  var promise = addPredefinedWords(addToDictionary, readLines);

  // because addPredefinedWords is async, Forth is async
  return promise.then(function () {
    return {
      readLine: readLine,
      readLines: readLines,
      keydown: function (keyCode) {
        context.keydown(keyCode);
      },
      getStack: function () {
        return context.stack.print();
      },
      isWaitingForKey: function () {
        return context.waitingForKey;
      }
    };
  });
}
