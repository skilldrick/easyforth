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

  // compile actions into definition and add definition to dictionary
  function compileAndAddToDictionary(name, actions) {
    var definition = compile(context.dictionary, actions);
    context.dictionary.add(name, definition);
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
  function readLine(line, cb) {
    return new Promise(function (resolve, reject) {
      var addOutput = cb || function () {};
      var tokenizer = Tokenizer(line);

      // processNextToken recursively executes tokens
      function processNextToken() {
        var nextToken = tokenizer.nextToken();

        if (!nextToken) { // reached end of line
          if (!currentDefinition) { // don't append output while definition is in progress
            addOutput(" ok");
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
            addOutput(output);

            if (context.waitingForKey) {
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
          addOutput(" " + e.message);
          resolve();
        }
      }

      processTokens();
    });
  }

  function readLines(codeLines, callbacks) {
    // Use reduce to execute promises in sequence
    return codeLines.reduce(function (promise, codeLine) {
      return promise.then(function () {
        callbacks && callbacks.lineCallback(codeLine);
        return readLine(codeLine, callbacks && callbacks.outputCallback);
      });
    }, Promise.resolve());
  }

  // because readLines is async, addPredefinedWords is async too
  var promise = addPredefinedWords(context.dictionary, readLines);

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
