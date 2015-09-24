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
  assertEqual(stack.print(), "1 2 3 <- Top ");
}


function runDictionaryTests() {
  var dictionary = Dictionary();

  console.log("Testing lookup of presets");
  assertEqual(typeof dictionary.lookup("+"), "function");

  console.log("Testing lookup of missing definition");
  assertEqual(dictionary.lookup("missing"), null);
}

function runForthTests() {
  (function () {
    var forth = Forth();

    console.log("Testing readLine");
    var output = forth.readLine("10 20 30");
    assertEqual(forth.getStack(), "10 20 30 <- Top ");
    assertEqual(output, "  ok");

    console.log("Testing funky space");
    forth.readLine("100\t200    300  ");

    assertEqual(forth.getStack(), "10 20 30 100 200 300 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing +");
    forth.readLine("10");
    assertEqual(forth.getStack(), "10 <- Top ");
    forth.readLine("3 4 +");
    assertEqual(forth.getStack(), "10 7 <- Top ");

    forth.readLine("+");
    assertEqual(forth.getStack(), "17 <- Top ");

    assertException(function () {
      forth.readLine("+");
    }, "Exception not thrown on empty stack");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing .");
    var output = forth.readLine("1 2 3 .");
    assertEqual(forth.getStack(), "1 2 <- Top ");
    assertEqual(output, " 3 ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing .s");
    var output = forth.readLine("1 2 3 .s");
    assertEqual(forth.getStack(), "1 2 3 <- Top ");
    assertEqual(output, " \n1 2 3 <- Top  ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing cr");
    var output = forth.readLine("1 2 . cr .");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " 2\n1 ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing emit");
    var output = forth.readLine("99 emit");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " c ok");

    output = forth.readLine("108 111 111 99 emit emit emit emit");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " cool ok");
  })();
}

function runTests() {
  runStackTests();
  runDictionaryTests();
  runForthTests();
}

runTests();
