'use strict';

/*
* compile works by first calling compileControlStructures to turn the
* flat sequence of actions into a nested arrangement of control structures.
*
* Main: one body, executed once
* Conditional: two bodies, executed conditional on top stack value
* Loop: one body, executed multiple times based on top stack values
*
* For example, the following input:
*
*    : foo  -1 if 10 0 do i . loop 2 then 1 ;
*
* would be transformed into the following structure:
*
*    Main {
*      body: [
*        Action { -1 },
*        Conditional {
*          consequent: [
*            Action { 10 },
*            Action { 0 },
*            Loop {
*              body: [ Action { i }, Action { . } ]
*            },
*            Action { 0 }
*          ]
*          alternative: []
*        },
*        Action { 1 }
*      ]
*    }
*
* Each control structure has its own execute method, which (with the help
* of executeActions) executes the appropriate child control structures.
*
*/

function UnbalancedControlStructureError() {
  this.message = "Unbalanced control structure";
}

function compile(dictionary, actions) {
  function executeActions(actions, stack, dictionary, returnStack) {
    var output = actions.map(function (action) {
      return action.execute(stack, dictionary, returnStack);
    });

    return output.join("");
  }

  function Main() {
    this.body = [];

    this.execute = function (stack, dictionary, returnStack) {
      return executeActions(this.body, stack, dictionary, returnStack);
    };
  }

  function Conditional(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.consequent = [];
    this.alternative = [];

    this.execute = function (stack, dictionary, returnStack) {
      if (stack.pop() !== FALSE) {
        return executeActions(this.consequent, stack, dictionary, returnStack);
      } else {
        return executeActions(this.alternative, stack, dictionary, returnStack);
      }
    };
  }

  function Loop(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.body = [];

    this.execute = function (stack, dictionary, returnStack) {
      var startIndex = stack.pop();
      var endIndex = stack.pop();
      var output = "";

      for (var i = startIndex; i < endIndex; i++) {
        returnStack.push(i);
        output += executeActions(this.body, stack, dictionary, returnStack);
        returnStack.pop();
      }

      return output;
    };
  }

  function Action(action) {
    this.execute = function (stack, dictionary, returnStack) {
      return action(stack, dictionary, returnStack);
    };
  }

  // compileControlStructures converts a one-dimensional list of actions interspersed
  // with controlCodes into a nested format with Main, Loop and Conditional structures.
  // Every action is wrapped in an Action structure.
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

  var main = compileControlStructures(actions);

  return function (stack, dictionary, returnStack) {
    return main.execute(stack, dictionary, returnStack);
  };
}
