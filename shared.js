'use strict';

var FALSE = 0;
var TRUE = -1;

function StackUnderflowError() {
  this.message = "Stack underflow";
}

function MissingWordError(word) {
  this.message = word + " ? ";
}
