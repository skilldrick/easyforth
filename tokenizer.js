function Tokenizer(input) {
  var index = 0;
  var length = input.length;
  var stringMode = false;
  var whitespace = /\s+/;
  var validToken = /\S+/;
  var definitionStart = /^\s*:/;
  var definitionEnd = /;\s*$/;

  function hasMore() {
    // Is there any non-whitespace remaining in the input?
    return !!input.slice(index).match(validToken);
  }

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

  function nextToken() {
    skipWhitespace();
    var isString = hasTokens('." ', index);
    var isParenComment = hasTokens('( ', index);

    var token = "";
    if (isString) {
      index += 3; // skip over ." and space
      while (input[index] !== '"' && index < length) {
        token += input[index];
        index++;
      }
      index++; // skip over final "
    } else if (isParenComment) {
      index += 2; // skip over ( and space
      while (input[index] !== ')' && index < length) {
        index++;
      }

      index++; // skip over final )
      return nextToken(); // ignore this token and return the next one
    } else {
      while (validToken.test(input[index]) && index < length) {
        token += input[index];
        index++;
      }
    }

    if (!token) {
      throw new EndOfInputError();
    }

    var returnObject = {
      token: token,
      string: isString
    };

    return returnObject;
  }

  return {
    hasMore: hasMore,
    nextToken: nextToken,
    isDefinitionStart: isDefinitionStart,
    isDefinitionEnd: isDefinitionEnd
  };
}
