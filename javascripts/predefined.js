function addPredefinedWords(addToDictionary, readLines, next) {
  function controlCode(code) {
    return {
      isControlCode: true,
      code: code
    };
  }

  [
    ":", ";", "if", "else", "then", "do", "loop",
    "+loop", "begin", "until", "variable", "constant", "key"
  ].forEach(function (code) {
    addToDictionary(code, controlCode(code));
  });

  addToDictionary(".",  function (context) {
    return context.stack.pop() + " ";
  });

  addToDictionary(".s", function (context) {
    return "\n" + context.stack.print();
  });

  addToDictionary("+", function (context) {
    context.stack.push(context.stack.pop() + context.stack.pop());
  });

  addToDictionary("-", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b - a);
  });

  addToDictionary("*", function (context) {
    context.stack.push(context.stack.pop() * context.stack.pop());
  });

  addToDictionary("/", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(Math.floor(b / a));
  });

  addToDictionary("/mod", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(Math.floor(b % a));
    context.stack.push(Math.floor(b / a));
  });

  addToDictionary("mod", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(Math.floor(b % a));
  });

  addToDictionary("=", function (context) {
    context.stack.push(context.stack.pop() === context.stack.pop() ? TRUE : FALSE);
  });

  addToDictionary("<", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b < a ? TRUE : FALSE);
  });

  addToDictionary(">", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b > a ? TRUE : FALSE);
  });

  addToDictionary("and", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b & a);
  });

  addToDictionary("or", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b | a);
  });

  addToDictionary("invert", function (context) {
    // invert is bitwise not
    context.stack.push(~context.stack.pop());
  });

  addToDictionary("i", function (context) {
    context.stack.push(context.returnStack.peek(1));
  });

  addToDictionary("j", function (context) {
    context.stack.push(context.returnStack.peek(2));
  });

  // I don't understand the difference between i and r@
  // http://www.forth.com/starting-forth/sf5/sf5.html
  addToDictionary("r@", function (context) {
    context.stack.push(context.returnStack.peek(1));
  });

  addToDictionary(">r", function (context) {
    context.returnStack.push(context.stack.pop());
  });

  addToDictionary("r>", function (context) {
    context.stack.push(context.returnStack.pop());
  });

  addToDictionary("emit", function (context) {
    return String.fromCharCode(context.stack.pop());
  });

  addToDictionary("swap", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(a);
    context.stack.push(b);
  });

  addToDictionary("dup", function (context) {
    var a = context.stack.pop();
    context.stack.push(a);
    context.stack.push(a);
  });

  addToDictionary("over", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b);
    context.stack.push(a);
    context.stack.push(b);
  });

  addToDictionary("rot", function (context) {
    var a = context.stack.pop(), b = context.stack.pop(), c = context.stack.pop();
    context.stack.push(b);
    context.stack.push(a);
    context.stack.push(c);
  });

  addToDictionary("drop", function (context) {
    context.stack.pop();
  });

  addToDictionary("!", function (context) {
    var address = context.stack.pop();
    var value = context.stack.pop();
    context.memory.setValue(address, value);
  });

  addToDictionary("@", function (context) {
    var address = context.stack.pop();
    context.stack.push(context.memory.getValue(address));
  });

  addToDictionary("allot", function (context) {
    context.memory.allot(context.stack.pop());
  });

  addToDictionary("key", function (context) {
    context.pause = true;

    // set callback for when key is pressed
    context.keydown = function (keyCode) {
      context.pause = false;
      context.keydown = null;
      context.stack.push(keyCode);
      context.onContinue();
    };
  });

  addToDictionary("sleep", function (context) {
    var timeout = context.stack.pop();
    context.pause = true;

    setTimeout(function () {
      context.pause = false;
      context.onContinue();
    }, timeout);
  });

  readLines([
    "variable  last-key", // create last-key variable for keyboard input
    ": cells   1 * ;",
    ": cr      10 emit ;",
    ": space   32 emit ;",
    ": spaces  0 do space loop ;",
    ": 0=      0 = ;",
    ": 0<      0 < ;",
    ": 0>      0 > ;",
    ": ?dup    dup if dup then ;",
    ": 2dup    over over ;",
    ": 1+      1 + ;",
    ": 1-      1 - ;",
    ": 2+      2 + ;",
    ": 2-      2 - ;",
    ": 2*      2 * ;",
    ": 2/      2 / ;",
    ": negate  -1 * ;",
    ": abs     dup 0< if negate then ;",
    ": min     2dup < if drop else swap drop then ;",
    ": max     2dup < if swap drop else drop then ;",
    ": ?       @ . ;",
    ": +!      dup @ rot + swap ! ;"
  ], next);
}
