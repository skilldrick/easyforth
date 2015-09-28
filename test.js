'use strict';

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
  var stack = Stack('test stack');

  stack.push(5);

  console.log("Testing pop (should cause underflow warning)");
  assertEqual(stack.pop(), 5);

  assertException(function () {
    stack.pop();
  }, "Exception not thrown on empty stack");

  console.log("Testing print");
  stack.push(1);
  stack.push(2);
  stack.push(3);
  assertEqual(stack.print(), "1 2 3 <- Top ");

  console.log("Testing peek");
  assertEqual(stack.peek(), 3);
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
    assertEqual(tokenizer.nextToken().value, "1");
    assertEqual(tokenizer.hasMore(), true);
    assertEqual(tokenizer.nextToken().value, "21");
    assertEqual(tokenizer.hasMore(), true);
    assertEqual(tokenizer.nextToken().value, "321");
    assertEqual(tokenizer.hasMore(), false);
    assertException(function () {
      tokenizer.nextToken();
    }, "Tokenizer did not throw exception when no more tokens");
  })();

  (function () {
    console.log("Testing string tokenizing");

    var tokenizer = new Tokenizer(' 1 ." hello world" ');
    assertEqual(tokenizer.nextToken().value, "1");
    assertEqual(tokenizer.nextToken().value, "hello world");
  })();

  (function () {
    console.log("Testing paren comment tokenizing");

    var tokenizer = new Tokenizer(' 1 ( this is a comment ) 2 ');
    assertEqual(tokenizer.nextToken().value, "1");
    assertEqual(tokenizer.nextToken().value, "2");
    assert(!tokenizer.hasMore(), "tokenizer should not have more");

    tokenizer = new Tokenizer('( this is a comment )');
    assert(!tokenizer.hasMore(), "tokenizer should not have more");
  })();

  (function () {
    console.log("Testing slash comment tokenizing");

    var tokenizer = new Tokenizer(' 1 \\ this is a comment 2 ');
    assertEqual(tokenizer.nextToken().value, "1");
    assert(!tokenizer.hasMore(), "tokenizer should not have more");
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

    console.log("Testing =");
    forth.readLine("10");
    forth.readLine("5 5 =");
    assertEqual(forth.getStack(), "10 -1 <- Top ");

    forth.readLine("4 5 =");
    assertEqual(forth.getStack(), "10 -1 0 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing <");
    forth.readLine("10");
    forth.readLine("5 4 <");
    assertEqual(forth.getStack(), "10 0 <- Top ");

    forth.readLine("4 5 <");
    assertEqual(forth.getStack(), "10 0 -1 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing >");
    forth.readLine("10");
    forth.readLine("5 4 >");
    assertEqual(forth.getStack(), "10 -1 <- Top ");

    forth.readLine("4 5 >");
    assertEqual(forth.getStack(), "10 -1 0 <- Top ");
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
    var output = forth.readLine(": add-20  10 + ");
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
    var output = forth.readLine(": add-20  10 + foo ");
    assertEqual(output, " foo ? "); // output error
    output = forth.readLine("5 5 + .");
    assertEqual(output, " 10  ok"); // output because definition has finished
  })();

  (function () {
    var forth = Forth();

    console.log("Testing missing words in interpreter");
    var output = forth.readLine("10 10 + foo ");
    assertEqual(output, " foo ? "); // output error
  })();

  (function () {
    var forth = Forth();

    console.log("Testing if/else/then with true condition");
    forth.readLine(": foo  -1 if 1 else 2 then 3 ; ");
    forth.readLine("foo");
    assertEqual(forth.getStack(), "1 3 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing if/else/then with false condition");
    forth.readLine(": foo  0 if 1 else 2 then 3 ; ");
    forth.readLine("foo");
    assertEqual(forth.getStack(), "2 3 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing simple nested if/else/then");
    forth.readLine(": foo  0 if 0 else -1 if 1 else 2 then then ; ");
    forth.readLine("foo");
    assertEqual(forth.getStack(), "1 <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing simple nested if/else/then with output");
    forth.readLine(': foo  0 if ." if1 " 0 else ." else1 "');
    forth.readLine('  -1 if ." if2 " 1 else ." else2 " 2 then then ; ');
    var output = forth.readLine("foo");
    assertEqual(forth.getStack(), "1 <- Top ");
    assertEqual(output, " else1 if2  ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing complex nested if/else/then");
    // example from http://www.forth.com/starting-forth/sf4/sf4.html
    forth.readLine(': eggsize   dup  18 < if  ." reject "      else');
    forth.readLine('            dup  21 < if  ." small "       else');
    forth.readLine('            dup  24 < if  ." medium "      else');
    forth.readLine('            dup  27 < if  ." large "       else');
    forth.readLine('            dup  30 < if  ." extra large " else');
    forth.readLine('                    ." error "');
    forth.readLine('            then then then then then drop ;');

    var output = forth.readLine('23 eggsize');
    assertEqual(output, " medium  ok");

    output = forth.readLine('29 eggsize');
    assertEqual(output, " extra large  ok");

    output = forth.readLine('31 eggsize');
    assertEqual(output, " error  ok");

    assertEqual(forth.getStack(), " <- Top ");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing do loop");
    var output = forth.readLine(': foo  4 0 do ." hello! " i . loop ; ');
    assertEqual(output, "  ok");
    output = forth.readLine("foo");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " hello! 0 hello! 1 hello! 2 hello! 3  ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing do loop");
    forth.readLine(': foo  4 0 do ." hello! " loop ; ');
    var output = forth.readLine("foo");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " hello! hello! hello! hello!  ok");
  })();

  (function () {
    var forth = Forth();

    console.log("Testing nested do loop");
    forth.readLine(': foo  3 0 do 2 0 do i . j . ."  " loop loop ; ');
    var output = forth.readLine("foo");
    assertEqual(forth.getStack(), " <- Top ");
    assertEqual(output, " 0 0  1 0  0 1  1 1  0 2  1 2   ok");
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
