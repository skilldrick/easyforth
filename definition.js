'use strict';

function compile(dictionary, toCompile) {
  function Conditional(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.consequent = [];
    this.alternative = [];
  }

  function Loop(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.body = [];
  }

  function compileConditionals(toCompile) {
    var compiledToExecute = [];
    var currentContext = compiledToExecute;
    var currentControlStructure = null;

    toCompile.forEach(function (action) {
      if (action.isControlCode) {
        switch (action.code) {
          case "if":
            currentControlStructure = new Conditional(currentContext, currentControlStructure);
            currentContext.push(currentControlStructure);
            // context is conditional consequent now
            currentContext = currentControlStructure.consequent;
            break;
          case "else":
            // context is conditional alternative now
            currentContext = currentControlStructure.alternative;
            break;
          case "then":
          case "loop":
            // context is parent context now
            currentContext = currentControlStructure.parentContext;
            currentControlStructure = currentControlStructure.parentControlStructure;
            break;
          case "do":
            currentControlStructure = new Loop(currentContext, currentControlStructure);
            currentContext.push(currentControlStructure);
            // context is conditional consequent now
            currentContext = currentControlStructure.body;
            break;
        }
      } else {
        currentContext.push(action);
      }
    });

    return compiledToExecute;
  }

  function execute(toExecute, stack, dictionary, returnStack) {
    var output = "";

    toExecute.forEach(function (action) {
      if (action instanceof Conditional) {
        if (stack.pop() !== FALSE) {
          output += execute(action.consequent, stack, dictionary, returnStack);
        } else {
          output += execute(action.alternative, stack, dictionary, returnStack);
        }
      } else if (action instanceof Loop) {
        var startIndex = stack.pop();
        var endIndex = stack.pop();

        for (var i = startIndex; i < endIndex; i++) {
          returnStack.push(i);
          output += execute(action.body, stack, dictionary, returnStack);
          returnStack.pop();
        }
      } else {
        var result = action(stack, dictionary, returnStack);
        output += getString(result);
      }
    });

    return output;
  }

  return function (stack, dictionary, returnStack) {
    var toExecute = compileConditionals(toCompile);
    return execute(toExecute, stack, dictionary, returnStack);
  };
}

function DefinitionBuilder(name, dictionary) {
  var toCompile = [];

  // This is currently copied from Forth so don't do that
  function addWord(token) {
    var definition = dictionary.lookup(token.value);
    var word = token.value;

    if (token.isStringLiteral) {
      toCompile.push(function (stack, dictionary, returnStack) {
        return word;
      });
    } else if (definition !== null) {
      toCompile.push(definition);
    } else if (isNumber(word)) {
      toCompile.push(function (stack, dictionary, returnStack) {
        stack.push(+word);
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
