'use strict';

/*
* compile works by first calling compileControlStructures to turn the
* flat sequence of actions into a nested arrangement of control structures.
*
* Main: one body, executed once
* Conditional: two bodies, executed conditional on top stack value
* DoLoop: one body, executed multiple times based on top stack values
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
*            DoLoop {
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
  function executeActions(actions, context) {
    function next(remainingActions) {
      if (remainingActions.length === 0) { // no actions left to execute
        return;
      } else {
        return remainingActions[0].execute(context).then(function (o) {
          context.addOutput(o);

          if (context.waitingForKey) {
            return new Promise(function (resolve) {
              context.afterKeyInputCallback = function () {
                return next(remainingActions.slice(1)).then(function () {
                  resolve();
                });
              };
            });
          } else {
            return next(remainingActions.slice(1));
          }
        });
      }
    }

    return next(actions);
  }

  function Main() {
    this.body = [];

    this.execute = function (context) {
      return executeActions(this.body, context);
    };
  }

  function Conditional(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.consequent = [];
    this.alternative = [];

    this.execute = function (context) {
      if (context.stack.pop() !== FALSE) {
        return executeActions(this.consequent, context);
      } else {
        return executeActions(this.alternative, context);
      }
    };
  }

  function DoLoop(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.body = [];
    this.isPlusLoop = false;

    this.execute = function (context) {
      var startIndex = context.stack.pop();
      var endIndex = context.stack.pop();
      var i = startIndex;

      var nextIteration = function () {
        if (i < endIndex) {
          context.returnStack.push(i);
          return executeActions(this.body, context).then(function (o) {
            context.returnStack.pop();

            // +loop increments i by stack value
            if (this.isPlusLoop) {
              i += context.stack.pop();
            } else { // loop increments i by 1
              i++;
            }

            return nextIteration();
          }.bind(this));
        } else {
          return;
        }
      }.bind(this);

      return nextIteration();
    };
  }

  function BeginUntil(parentContext, parentControlStructure) {
    this.parentContext = parentContext;
    this.parentControlStructure = parentControlStructure;
    this.body = [];

    this.execute = function (context) {
      var nextIteration = function () {
        return executeActions(this.body, context).then(function (o) {
          if (context.stack.pop() === TRUE) {
            return;
          } else {
            return nextIteration();
          }
        });
      }.bind(this);

      return nextIteration();
    };
  }

  function Action(action) {
    this.name = action._name; // expose name for easy debugging

    this.execute = function (context) {
      return new Promise(function (resolve) {
        resolve(action(context));
      });
    };
  }

  // compileControlStructures converts a one-dimensional list of actions interspersed with
  // controlCodes into a nested format with Main, DoLoop, BeginUntil, and Conditional structures.
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
          case "do":
            currentControlStructure = new DoLoop(currentContext, currentControlStructure);
            currentContext.push(currentControlStructure);
            // context is loop body now
            currentContext = currentControlStructure.body;
            break;
          case "begin":
            currentControlStructure = new BeginUntil(currentContext, currentControlStructure);
            currentContext.push(currentControlStructure);
            // context is loop body now
            currentContext = currentControlStructure.body;
            break;
          case "else":
            // context is conditional alternative now
            currentContext = currentControlStructure.alternative;
            break;
          case "+loop":
            // +loop is special case of loop
            currentControlStructure.isPlusLoop = true;
            // fallthrough
          case "then":
          case "loop":
          case "until":
            // context is parent context now
            currentContext = currentControlStructure.parentContext;
            currentControlStructure = currentControlStructure.parentControlStructure;
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

  return function (context) {
    return main.execute(context);
  };
}
