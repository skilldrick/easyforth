
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

function Forth() {
  var stack = Stack();

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
