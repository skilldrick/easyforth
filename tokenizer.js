'use strict';

function Tokenizer(input) {
  var index = 0;
  var length = input.length;
  var stringMode = false;
  var whitespace = /\s+/;
  var validToken = /\S+/;
  var definitionStart = /^\s*:/;
  var definitionEnd = /;\s*$/;

  function isDefinitionStart() {
    return input.match(definitionStart);
  }

  function isDefinitionEnd() {
    return input.match(definitionEnd);
  }

  function skipWhitespace() {
    // Skip over leading whitespace
    while (whitespace.test(input[index]) && index < length) {
      index++;
    }
  }

  // Does input have these tokens at this index?
  function hasTokens(tokens, startIndex) {
    for (var i = 0; i < tokens.length; i++) {
      if (input[startIndex + i] != tokens[i]) {
        return false;
      }
    }
    return true;
  }

  function getNextToken() {
    skipWhitespace();
    var isStringLiteral = hasTokens('." ', index);
    var isParenComment = hasTokens('( ', index);
    var isSlashComment = hasTokens('\\ ', index);

    var value = "";
    if (isStringLiteral) {
      index += 3; // skip over ." and space
      while (input[index] !== '"' && index < length) {
        value += input[index];
        index++;
      }
      index++; // skip over final "
    } else if (isParenComment) {
      index += 2; // skip over ( and space
      while (input[index] !== ')' && index < length) {
        index++;
      }

      index++; // skip over final )
      return getNextToken(); // ignore this token and return the next one
    } else if (isSlashComment) {
      return null;
    } else {
      while (validToken.test(input[index]) && index < length) {
        value += input[index];
        index++;
      }
    }

    if (!value) {
      return null;
    }

    return {
      value: value,
      isStringLiteral: isStringLiteral
    };
  }

  function nextToken() {
    return getNextToken();
  }

  return {
    nextToken: nextToken,
    isDefinitionStart: isDefinitionStart,
    isDefinitionEnd: isDefinitionEnd
  };
}
