function Stack() {
  var arr = [];

  return {
    push: function (item) {
      arr.push(item);
    },
    pop: function () {
      if (arr.length > 0) {
        return arr.pop();
      } else {
        throw new Error("Stack underflow");
      }
    },
    print: function () {
      return arr.join(" ") + " <- Top";
    }
  };
}

function Dictionary() {
  // The dict is searched from beginning to end, so new definitions
  // need to be unshifted. This is usually a linked list, but meh
  var dict = [
    [ ".", function () { console.log("Not implemented"); } ],
    [ "+", function () { console.log("Not implemented"); } ]
  ];

  function add(definition) {

  }

  // Missing key returns null
  function lookup(key) {
    var item = dict.find(function (item) {
      return item[0] === key;
    });

    if (item === undefined) {
      return null;
    } else {
      return item[1];
    }
  }

  return {
    add: add,
    lookup: lookup
  };
}

function Forth() {
  var stack = Stack();
  var dictionary = Dictionary();

  function readLine(line) {
    var words = line.split(" ");
    words.forEach(function (word) {
      stack.push(word);
    });
  }

  return {
    readLine: readLine,
    getStack: function () {
      return stack.print();
    }
  };
}
