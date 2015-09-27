'use strict';

function Forth() {
  var inDefinition = false;
  var currentDefinition = null;
  var stack = Stack('Argument Stack');
  var returnStack = Stack('Return Stack');
  var dictionary = Dictionary();

  function startDefinition() {
    inDefinition = true;
  }

  function endDefinition() {
    inDefinition = false;
  }

  function processWord(token) {
    if (token.string) {
      return "";
    }

    var word = token.token;

    // TODO: find a better name for "definition" here
    var definition = dictionary.lookup(word);

    if (definition !== null) {
      return getString(definition(stack, dictionary, returnStack));
    } else if (isNumber(word)) {
      stack.push(+word);
    } else {
      invalidWord(word);
    }

    return "";
  }

  function readLine(line) {
    var tokenizer = Tokenizer(line);

    if (tokenizer.isDefinitionStart()) {
      startDefinition();
      tokenizer.nextToken(); // drop :
      var definitionName = tokenizer.nextToken().token;
      currentDefinition = new Definition(definitionName, dictionary);
    }

    // The duplication between this case and the other is pretty bad
    if (inDefinition) {
      while (tokenizer.hasMore()) {
        try {
          currentDefinition.addWord(tokenizer.nextToken());
        } catch (e) {
          if (e instanceof EndOfInputError || e instanceof MissingWordError) {
            endDefinition();
            currentDefinition = null;
            return " " + e.message;
          } else {
            throw e;
          }
        }
      }

      if (tokenizer.isDefinitionEnd()) {
        endDefinition();
        currentDefinition.addToDictionary();
        return "  ok";
      }
    } else {
      var output = "";

      while (tokenizer.hasMore()) {
        try {
          output += processWord(tokenizer.nextToken());
        } catch (e) {
          if (e instanceof EndOfInputError || e instanceof MissingWordError || e instanceof StackUnderflowError) {
            return " " + e.message;
          } else {
            throw e;
          }
        }
      }

      return " " + output + " ok";
    }

    return "";
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

  return {
    readLine: readLine,
    getStack: function () {
      return stack.print();
    }
  };
}
