'use strict';

var FALSE = 0;
var TRUE = -1;

function StackUnderflowError() {
  this.message = "Stack underflow";
}

function EndOfInputError() {
  this.message = "nextToken called with no more tokens";
}

function MissingWordError(word) {
  this.message = word + " ? ";
}
