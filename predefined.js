function addPredefinedWords(dictionary, readLine) {
  function controlCode(code) {
    return {
      isControlCode: true,
      code: code
    };
  }

  ["if", "else", "then", "do", "loop", "+loop", "begin", "until"].forEach(function (code) {
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
    context.stack.push(a !== FALSE && b !== FALSE ? TRUE : FALSE);
  });

  dictionary.add("or", function (context) {
    var a = context.stack.pop(), b = context.stack.pop();
    context.stack.push(a !== FALSE || b !== FALSE ? TRUE : FALSE);
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

  readLine(": cr  10 emit ;");
  readLine(": space  32 emit ;");
  readLine(": spaces  0 do space loop ;");
  readLine(": 0=  0 = ;");
  readLine(": 0<  0 < ;");
  readLine(": 0>  0 > ;");
  readLine(": ?dup  dup if dup then ;");
  readLine(": 2dup  over over ;");
  readLine(": 1+  1 + ;");
  readLine(": 1-  1 - ;");
  readLine(": 2+  2 + ;");
  readLine(": 2-  2 - ;");
  readLine(": 2*  2 * ;");
  readLine(": 2/  2 / ;");
  readLine(": negate  -1 * ;");
  readLine(": abs  dup 0< if negate then ;");
  readLine(": min  2dup < if drop else swap drop then ;");
  readLine(": max  2dup < if swap drop else drop then ;");
}
