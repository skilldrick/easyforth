'use strict';

var FALSE = 0;
var TRUE = -1;

function controlCode(code) {
  return {
    isControlCode: true,
    code: code
  };
}

function StackUnderflowError() {
  this.message = "Stack underflow";
}

function EndOfInputError() {
  this.message = "nextToken called with no more tokens";
}

function MissingWordError(word) {
  this.message = word + " ? ";
}

function isNumber(val) {
  return +val + "" === val;
}

function invalidWord(word) {
  if (word !== ";") { // Can safely skip ;
    throw new MissingWordError(word);
  }
}

// Convert value to string, but undefined to ""
function getString(output) {
  if (output === undefined) {
    return "";
  } else {
    return "" + output;
  }
}
