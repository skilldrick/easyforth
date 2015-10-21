function addPredefinedWords(dictionary, readLines) {
  function controlCode(code) {
    return {
      isControlCode: true,
      code: code
    };
  }

  [
    ":", ";", "if", "else", "then", "do", "loop",
    "+loop", "begin", "until", "variable", "constant"
  ].forEach(function (code) {
    dictionary.add(code, controlCode(code));
  });

  dictionary.add(".",  function (context) {
    return context.stack.pop() + " ";
  });

  dictionary.add(".s", function (context) {
    return "\n" + context.stack.print();
  });

  dictionary.add("+", function (context) {
    context.stack.push(context.stack.pop() + context.stack.pop());
  });

  dictionary.add("-", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b - a);
  });

  dictionary.add("*", function (context) {
    context.stack.push(context.stack.pop() * context.stack.pop());
  });

  dictionary.add("/", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(Math.floor(b / a));
  });

  dictionary.add("/mod", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(Math.floor(b % a));
    context.stack.push(Math.floor(b / a));
  });

  dictionary.add("mod", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(Math.floor(b % a));
  });

  dictionary.add("=", function (context) {
    context.stack.push(context.stack.pop() === context.stack.pop() ? TRUE : FALSE);
  });

  dictionary.add("<", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b < a ? TRUE : FALSE);
  });

  dictionary.add(">", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b > a ? TRUE : FALSE);
  });

  dictionary.add("and", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b & a);
  });

  dictionary.add("or", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b | a);
  });

  dictionary.add("invert", function (context) {
    // invert is bitwise not
    context.stack.push(~context.stack.pop());
  });

  dictionary.add("i", function (context) {
    context.stack.push(context.returnStack.peek(1));
  });

  dictionary.add("j", function (context) {
    context.stack.push(context.returnStack.peek(2));
  });

  // I don't understand the difference between i and r@
  // http://www.forth.com/starting-forth/sf5/sf5.html
  dictionary.add("r@", function (context) {
    context.stack.push(context.returnStack.peek(1));
  });

  dictionary.add(">r", function (context) {
    context.returnStack.push(context.stack.pop());
  });

  dictionary.add("r>", function (context) {
    context.stack.push(context.returnStack.pop());
  });

  dictionary.add("emit", function (context) {
    return String.fromCharCode(context.stack.pop());
  });

  dictionary.add("swap", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(a);
    context.stack.push(b);
  });

  dictionary.add("dup", function (context) {
    var a = context.stack.pop();
    context.stack.push(a);
    context.stack.push(a);
  });

  dictionary.add("over", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(b);
    context.stack.push(a);
    context.stack.push(b);
  });

  dictionary.add("rot", function (context) {
    var a = context.stack.pop(), b = context.stack.pop(), c = context.stack.pop();
    context.stack.push(b);
    context.stack.push(a);
    context.stack.push(c);
  });

  dictionary.add("drop", function (context) {
    context.stack.pop();
  });

  dictionary.add("!", function (context) {
    var address = context.stack.pop();
    var value = context.stack.pop();
    context.memory.setValue(address, value);
  });

  dictionary.add("@", function (context) {
    var address = context.stack.pop();
    context.stack.push(context.memory.getValue(address));
  });

  dictionary.add("allot", function (context) {
    context.memory.allot(context.stack.pop());
  });

  return readLines([
    ": cells  1 * ;",
    ": cr  10 emit ;",
    ": space  32 emit ;",
    ": spaces  0 do space loop ;",
    ": 0=  0 = ;",
    ": 0<  0 < ;",
    ": 0>  0 > ;",
    ": ?dup  dup if dup then ;",
    ": 2dup  over over ;",
    ": 1+  1 + ;",
    ": 1-  1 - ;",
    ": 2+  2 + ;",
    ": 2-  2 - ;",
    ": 2*  2 * ;",
    ": 2/  2 / ;",
    ": negate  -1 * ;",
    ": abs  dup 0< if negate then ;",
    ": min  2dup < if drop else swap drop then ;",
    ": max  2dup < if swap drop else drop then ;"
  ]);
}
