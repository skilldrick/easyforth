'use strict';

function UnbalancedControlStructureError() {
  this.message = "Unbalanced control structure";
}

function compile(dictionary, actions) {
  function Main() {
    this.body = [];

    this.run = function (stack, dictionary, returnStack) {
      return execute(this.body, stack, dictionary, returnStack);
    };
  }

  function Conditional(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.consequent = [];
    this.alternative = [];

    this.run = function (stack, dictionary, returnStack) {
      if (stack.pop() !== FALSE) {
        return execute(this.consequent, stack, dictionary, returnStack);
      } else {
        return execute(this.alternative, stack, dictionary, returnStack);
      }
    };
  }

  function Loop(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.body = [];

    this.run = function (stack, dictionary, returnStack) {
      var startIndex = stack.pop();
      var endIndex = stack.pop();
      var output = "";

      for (var i = startIndex; i < endIndex; i++) {
        returnStack.push(i);
        output += execute(this.body, stack, dictionary, returnStack);
        returnStack.pop();
      }

      return output;
    };
  }

  function Action(action) {
    this.run = function (stack, dictionary, returnStack) {
      return action(stack, dictionary, returnStack);
    };
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
        currentContext.push(new Action(action));
      }
    });

    if (currentControlStructure !== main) {
      throw new UnbalancedControlStructureError();
    }

    return main;
  }

  // Each action may recursively call execute to execute its children actions
  function execute(toExecute, stack, dictionary, returnStack) {
    var output = toExecute.map(function (action) {
      return action.run(stack, dictionary, returnStack);
    });

    return output.join("");
  }

  var main = compileControlStructures(actions);

  return function (stack, dictionary, returnStack) {
    return execute([main], stack, dictionary, returnStack);
  };
}
