
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
    }
  };
}

function Forth() {


  function readLine(line) {

  }

  return {
    readLine: readLine
  };
}
