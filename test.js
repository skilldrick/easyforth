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
  assert(a === b, a + " was not equal to " + b);
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
  assertEqual(stack.pop(), 5, "Pop should be 5");

  assertException(function () {
    stack.pop();
  }, "Exception not thrown on empty stack");

  console.log("Testing print");
  stack.push(1);
  stack.push(2);
  stack.push(3);
  assertEqual(stack.print(), "1 2 3 <- Top");
}


function runDictionaryTests() {
  var dictionary = Dictionary();

  console.log("Testing lookup of presets");
  assertEqual(typeof dictionary.lookup("+"), "function");

  console.log("Testing lookup of missing definition");
  assertEqual(dictionary.lookup("missing"), null);
}

function runForthTests() {
  var forth = Forth();

  console.log("Testing readLine");
  forth.readLine("10 20 30");
  assertEqual(forth.getStack(), "10 20 30 <- Top");
}

function runTests() {
  runStackTests();
  runForthTests();
  runDictionaryTests();
}

runTests();
