'use strict';

function compile(dictionary, actions) {
  function Main() {
    this.body = [];
  }

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

  // compileControlStructures converts a one-dimensional list of actions interspersed
  // with controlCodes into a nested format with Loop and Conditional actions
  function compileControlStructures(actions) {
    var main = new Main();
    var currentContext = main.body;
    var currentControlStructure = main;

    actions.forEach(function (action) {
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
            // context is loop body now
            currentContext = currentControlStructure.body;
            break;
        }
      } else {
        currentContext.push(action);
      }
    });

    return main;
  }

  function execute(toExecute, stack, dictionary, returnStack) {
    var output = "";

    toExecute.forEach(function (action) {
      if (action instanceof Main) {
        output += execute(action.body, stack, dictionary, returnStack);
      } else if (action instanceof Conditional) {
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
        output += action(stack, dictionary, returnStack);
      }
    });

    return output;
  }

  return function (stack, dictionary, returnStack) {
    var main = compileControlStructures(actions);
    return execute([main], stack, dictionary, returnStack);
  };
}
