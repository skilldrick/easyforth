var failures = [];

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
    failures.push(message);
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

  dictionary.add("+", function (stack, dictionary) {
    stack.push(stack.pop() + stack.pop());
  });

  console.log("Testing lookup of existing definitions");
  assertEqual(typeof dictionary.lookup("+"), "function");

  console.log("Testing lookup of missing definition");
  assertEqual(dictionary.lookup("missing"), null);
}

function runTokenizerTests() {
  (function () {
    console.log("Testing nextToken and hasMore");
    var tokenizer = new Tokenizer(" 1 21 321 ");
    assertEqual(tokenizer.hasMore(), true);
    assertEqual(tokenizer.nextToken().token, "1");
    assertEqual(tokenizer.hasMore(), true);
    assertEqual(tokenizer.nextToken().token, "21");
    assertEqual(tokenizer.hasMore(), true);
    assertEqual(tokenizer.nextToken().token, "321");
    assertEqual(tokenizer.hasMore(), false);
    assertException(function () {
      tokenizer.nextToken();
    }, "Tokenizer did not throw exception when no more tokens");
  })();

  (function () {
    console.log("Testing string tokenizing");

    var tokenizer = new Tokenizer(' 1 ." hello world" ');
    assertEqual(tokenizer.nextToken().token, "1");
    assertEqual(tokenizer.nextToken().token, "hello world");
  })();
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

    var output = forth.readLine("+");
    assertEqual(output, " Stack underflow");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing *");
    forth.readLine("10");
    forth.readLine("22 4 *");
    assertEqual(forth.getStack(), "10 88 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing /");
    forth.readLine("10");
    forth.readLine("22 4 /");
    assertEqual(forth.getStack(), "10 5 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing mod");
    forth.readLine("10");
    forth.readLine("22 4 mod");
    assertEqual(forth.getStack(), "10 2 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing /mod");
    forth.readLine("10");
    forth.readLine("22 4 /mod");
    assertEqual(forth.getStack(), "10 2 5 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing swap");
    forth.readLine("10 5");
    assertEqual(forth.getStack(), "10 5 <- Top ");
    forth.readLine("swap");
    assertEqual(forth.getStack(), "5 10 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing dup");
    forth.readLine("10 5");
    assertEqual(forth.getStack(), "10 5 <- Top ");
    forth.readLine("dup");
    assertEqual(forth.getStack(), "10 5 5 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing over");
    forth.readLine("10 5");
    assertEqual(forth.getStack(), "10 5 <- Top ");
    forth.readLine("over");
    assertEqual(forth.getStack(), "10 5 10 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing rot");
    forth.readLine("1 2 3");
    assertEqual(forth.getStack(), "1 2 3 <- Top ");
    forth.readLine("rot");
    assertEqual(forth.getStack(), "2 3 1 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing drop");
    forth.readLine("1 2 3");
    assertEqual(forth.getStack(), "1 2 3 <- Top ");
    forth.readLine("drop");
    assertEqual(forth.getStack(), "1 2 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing .");
    var output = forth.readLine("1 2 3 .");
    assertEqual(forth.getStack(), "1 2 <- Top ");
    assertEqual(output, " 3  ok");
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
    assertEqual(output, " 2 \n1  ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing space");
    var output = forth.readLine("1 2 . space space .");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " 2   1  ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing spaces");
    var output = forth.readLine("1 2 . 5 spaces .");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " 2      1  ok");
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

  (function () {
    var forth = Forth();

    console.log("Testing :");
    var output = forth.readLine(": add-10  10 + ;");
    assertEqual(output, "  ok");
    forth.readLine("5 add-10");
    assertEqual(forth.getStack(), "15 <- Top ");
  })();


  (function () {
    var forth = Forth();

    console.log("Testing multiline :");
    output = forth.readLine(": add-20  10 + ");
    assertEqual(output, ""); // no output here
    output = forth.readLine(" 5 + ");
    assertEqual(output, ""); // no output here
    output = forth.readLine(" 5 + ; ");
    assertEqual(output, "  ok"); // output ok after definition
    forth.readLine("5 add-20");
    assertEqual(forth.getStack(), "25 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing missing words in :");
    output = forth.readLine(": add-20  10 + foo ");
    assertEqual(output, " foo ? "); // output error
    output = forth.readLine("5 5 + .");
    assertEqual(output, " 10  ok"); // output because definition has finished
  })();

  (function () {
    var forth = Forth();

    console.log("Testing missing words in interpreter");
    output = forth.readLine("10 10 + foo ");
    assertEqual(output, " foo ? "); // output error
  })();

}

// Wow such test runner
function runTests() {
  runStackTests();
  runDictionaryTests();
  runTokenizerTests();
  runForthTests();

  if (failures.length) {
    console.log("Failed tests");
    console.log(failures.join("\n"));
  }
}

runTests();
