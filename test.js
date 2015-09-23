function success() {
  console.log(".");
}

function failure(message) {
  console.log("x", message);
}

function assert(condition, message) {
  if (condition) {
    success();
  } else {
    failure(message);
  }
}

function assertEqual(a, b) {
  assert(a == b, "Not equal");
}

function assertException(func, message) {
  var exceptionWasThrown = false;
  try {
    func();
  } catch (e) {
    exceptionWasThrown = true;
  }

  assert(exceptionWasThrown, message);
}

function runStackTests() {
  var stack = Stack();

  stack.push(5);

  console.log("Testing pop");
  assert(stack.pop() == 5, "Pop should be 5");

  assertException(function () {
    stack.pop();
  }, "Exception not thrown on empty stack");
}

function runForthTests() {
  var forth = Forth();

  forth.readLine("1 2 3");
}

function runTests() {
  runStackTests();
  runForthTests();
}

runTests();
