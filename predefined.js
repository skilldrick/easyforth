function addPredefinedWords(dictionary, readLine) {
  function controlCode(code) {
    return {
      isControlCode: true,
      code: code
    };
  }

  ["if", "else", "then", "do", "loop"].forEach(function (code) {
    dictionary.add(code, controlCode(code));
  });

  dictionary.add(".",  function (stack, dictionary, returnStack) {
    return stack.pop() + " ";
  });

  dictionary.add(".s", function (stack, dictionary, returnStack) {
    return "\n" + stack.print();
  });

  dictionary.add("+", function (stack, dictionary, returnStack) {
    stack.push(stack.pop() + stack.pop());
  });

  dictionary.add("-", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(b - a);
  });

  dictionary.add("*", function (stack, dictionary, returnStack) {
    stack.push(stack.pop() * stack.pop());
  });

  dictionary.add("/", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(Math.floor(b / a));
  });

  dictionary.add("/mod", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(Math.floor(b % a));
    stack.push(Math.floor(b / a));
  });

  dictionary.add("mod", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(Math.floor(b % a));
  });

  dictionary.add("=", function (stack, dictionary, returnStack) {
    stack.push(stack.pop() === stack.pop() ? TRUE : FALSE);
  });

  dictionary.add("<", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(b < a ? TRUE : FALSE);
  });

  dictionary.add(">", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(b > a ? TRUE : FALSE);
  });

  dictionary.add("and", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(a !== FALSE && b !== FALSE ? TRUE : FALSE);
  });

  dictionary.add("or", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(a !== FALSE || b !== FALSE ? TRUE : FALSE);
  });

  dictionary.add("i", function (stack, dictionary, returnStack) {
    stack.push(returnStack.peek(1));
  });

  dictionary.add("j", function (stack, dictionary, returnStack) {
    stack.push(returnStack.peek(2));
  });

  // I don't understand the difference between i and r@
  // http://www.forth.com/starting-forth/sf5/sf5.html
  dictionary.add("r@", function (stack, dictionary, returnStack) {
    stack.push(returnStack.peek(1));
  });

  dictionary.add(">r", function (stack, dictionary, returnStack) {
    returnStack.push(stack.pop());
  });

  dictionary.add("r>", function (stack, dictionary, returnStack) {
    stack.push(returnStack.pop());
  });

  dictionary.add("emit", function (stack, dictionary, returnStack) {
    return String.fromCharCode(stack.pop());
  });

  dictionary.add("swap", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(a);
    stack.push(b);
  });

  dictionary.add("dup", function (stack, dictionary, returnStack) {
    var a = stack.pop();
    stack.push(a);
    stack.push(a);
  });

  dictionary.add("over", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop();
    stack.push(b);
    stack.push(a);
    stack.push(b);
  });

  dictionary.add("rot", function (stack, dictionary, returnStack) {
    var a = stack.pop(), b = stack.pop(), c = stack.pop();
    stack.push(b);
    stack.push(a);
    stack.push(c);
  });

  dictionary.add("drop", function (stack, dictionary, returnStack) {
    stack.pop();
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