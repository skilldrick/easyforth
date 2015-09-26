function Definition(name, dictionary) {
  var toExecute = [];

  // This is currently copied from Forth so don't do that
  function addWord(token) {
    var definition = dictionary.lookup(token.token);
    var word = token.token;

    if (definition !== null) {
      if (definition.isControlCode) {
        toExecute.push(definition);
      } else {
        toExecute.push(function (stack, dictionary) {
          return definition(stack, dictionary);
        });
      }
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

  function shouldExecute(context) {
    context = context || {};
    return !context.inConditional ||
      (context.parentShouldExecute &&
        (context.trueCondition === context.inIf));

  }

  function compile() {
    dictionary.add(name, function (stack, dictionary) {
      var controlStack = []; // used for keeping track of control structures
      controlStack.peek = function () {
        return this[this.length - 1];
      };

      var output = "";

      toExecute.forEach(function (action) {
        if (action.isControlCode) {
          var parentShouldExecute = shouldExecute(controlStack.peek());
          switch (action.code) {
            case "if":
              if (parentShouldExecute) {
                controlStack.push({
                  parentShouldExecute: true,
                  inConditional: true,
                  inIf: true,
                  trueCondition: stack.pop() !== FALSE
                });
              } else {
                controlStack.push({
                  parentShouldExecute: false,
                  inConditional: true
                });
              }
              break;
            case "else":
              controlStack.peek().inIf = false;
              break;
            case "then":
              controlStack.pop();
              break;
          }
        } else {
          // Execute if not in a conditional or in the if part when true
          // or in the else part when false
          if (shouldExecute(controlStack.peek())) {
            var result = action(stack, dictionary);
            output += getString(result);
          }
        }
      });
      return output;
    });
  }

  return {
    addWord: addWord,
    compile: compile
  };
}
