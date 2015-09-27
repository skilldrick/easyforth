'use strict';

function Forth() {
  var inDefinition = false;
  var currentDefinition = null;
  var stack = Stack('Argument Stack');
  var returnStack = Stack('Return Stack');
  var dictionary = Dictionary();

  // Throw if error is not of one of these types
  function throwIfNot(e, errorTypes) {
    var shouldHandle = errorTypes.some(function (errorType) {
      return e instanceof errorType;
    });

    if (!shouldHandle) {
      throw e;
    }
  }

  function processWord(token) {
    if (token.isStringLiteral) {
      return "";
    }

    var word = token.value;

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
      inDefinition = true;
      tokenizer.nextToken(); // drop :
      var definitionName = tokenizer.nextToken().value;
      currentDefinition = new DefinitionBuilder(definitionName, dictionary);
    }

    // The duplication between this case and the other is pretty bad
    if (inDefinition) {
      while (tokenizer.hasMore()) {
        try {
          currentDefinition.addWord(tokenizer.nextToken());
        } catch (e) {
          throwIfNot(e, [EndOfInputError, MissingWordError]);
          inDefinition = false;
          currentDefinition = null;
          return " " + e.message;
        }
      }

      if (tokenizer.isDefinitionEnd()) {
        currentDefinition.addToDictionary();
        inDefinition = false;
        currentDefinition = null;
        return "  ok";
      }
    } else { // not in definition, i.e. interactive mode
      var output = "";

      while (tokenizer.hasMore()) {
        try {
          output += processWord(tokenizer.nextToken());
        } catch (e) {
          throwIfNot(e, [EndOfInputError, MissingWordError, StackUnderflowError]);
          return " " + e.message;
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
