function Forth() {
  var inDefinition = false;
  var currentDefinition = null;
  var stack = Stack();
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

    var definition = dictionary.lookup(word);

    if (definition !== null) {
      return getString(definition(stack, dictionary));
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


  dictionary.add(".",  function (stack, dictionary) {
    return stack.pop() + " ";
  });

  dictionary.add(".s", function (stack, dictionary) {
    return "\n" + stack.print();
  });

  dictionary.add("+", function (stack, dictionary) {
    stack.push(stack.pop() + stack.pop());
  });

  dictionary.add("*", function (stack, dictionary) {
    stack.push(stack.pop() * stack.pop());
  });

  dictionary.add("/", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop();
    stack.push(Math.floor(b / a));
  });

  dictionary.add("/mod", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop();
    stack.push(Math.floor(b % a));
    stack.push(Math.floor(b / a));
  });

  dictionary.add("mod", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop();
    stack.push(Math.floor(b % a));
  });

  dictionary.add("=", function (stack, dictionary) {
    stack.push(stack.pop() === stack.pop() ? TRUE : FALSE);
  });

  dictionary.add("<", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop();
    stack.push(b < a ? TRUE : FALSE);
  });

  dictionary.add(">", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop();
    stack.push(b > a ? TRUE : FALSE);
  });

  dictionary.add("emit", function (stack, dictionary) {
    return String.fromCharCode(stack.pop());
  });

  dictionary.add("swap", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop();
    stack.push(a);
    stack.push(b);
  });

  dictionary.add("dup", function (stack, dictionary) {
    var a = stack.pop();
    stack.push(a);
    stack.push(a);
  });

  dictionary.add("over", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop();
    stack.push(b);
    stack.push(a);
    stack.push(b);
  });

  dictionary.add("rot", function (stack, dictionary) {
    var a = stack.pop(), b = stack.pop(), c = stack.pop();
    stack.push(b);
    stack.push(a);
    stack.push(c);
  });

  dictionary.add("drop", function (stack, dictionary) {
    stack.pop();
  });

  dictionary.add("if", controlCode("if"));
  dictionary.add("else", controlCode("else"));
  dictionary.add("then", controlCode("then"));

  readLine(": cr 10 emit ;");

  readLine(": space 32 emit ;");

  // can implement this as a readLine when we have loops
  dictionary.add("spaces", function (stack, dictionary) {
    return new Array(stack.pop() + 1).join(" ");
  });

  return {
    readLine: readLine,
    getStack: function () {
      return stack.print();
    }
  };
}
