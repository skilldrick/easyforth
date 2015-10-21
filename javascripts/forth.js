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
      return action(context);
    }
    return "";
  }

  // Read a line of input. Callback is called with output for this line.
  function readLine(line, cb) {
    return new Promise(function (resolve, reject) {
      var output = cb || function () {};
      var tokenizer = Tokenizer(line);

      function processTokens() {
        var nextToken;

        while (nextToken = tokenizer.nextToken()) {
          var action = tokenToAction(nextToken)

          if (currentDefinition) { // Are we currently defining a definition?
            addActionToCurrentDefinition(action);
          } else {
            output(executeRuntimeAction(tokenizer, action));
            /*
            // this is proof of concept to show that we can break execution of
            // processTokens and resume later (needed for key input)
            setTimeout(function () {
              processTokensWithCatch();
            }, 0);
            break;
            */
          }
        }

        if (!nextToken) { // we didn't break out of the loop, so must be done
          if (!currentDefinition) { // don't append output while definition is in progress
            output(" ok");
          }
          resolve();
        }
      }

      function processTokensWithCatch() {
        try {
          processTokens();
        } catch (e) {
          currentDefinition = null;
          output(" " + e.message);
          resolve();
        }
      }

      processTokensWithCatch();
    });
  }

  function readLines(codeLines, lineCallback, outputCallback) {
    // Use reduce to execute promises in sequence
    return codeLines.reduce(function (promise, codeLine) {
      return promise.then(function () {
        lineCallback && lineCallback(codeLine);
        return readLine(codeLine, outputCallback);
      });
    }, Promise.resolve());
  }

  // because readLines is async, addPredefinedWords is async too
  var promise = addPredefinedWords(context.dictionary, readLines);

  return promise.then(function () {
    return {
      readLine: readLine,
      readLines: readLines,
      getStack: function () {
        return context.stack.print();
      }
    };
  });
}
