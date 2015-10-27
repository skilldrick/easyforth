var FALSE = 0;
var TRUE = -1;

// Takes an array of nullary functions that return promises and executes them in series,
// collecting the output from each, and finally resolving with the combined output
function executeInSequence(promiseFunctions) {
  var output = [];

  // Takes a promise and returns a promise that collects the output of the original
  // promise. New promise resolves with joined output.
  function addOutput(promise) {
    return promise.then(function (o) {
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
