describe('Tokenizer', function() {
  describe('nextToken', function () {
    it('returns correct value, and null when empty', function () {
      var tokenizer = new Tokenizer(" 1 21 321 ");
      expect(tokenizer.nextToken().value).toBe("1");
      expect(tokenizer.nextToken().value).toBe("21");
      expect(tokenizer.nextToken().value).toBe("321");
      expect(tokenizer.nextToken()).toBe(null);
    });

    it('handles strings', function () {
      var tokenizer = new Tokenizer(' 1 ." hello world" ');
      expect(tokenizer.nextToken().value).toBe("1");
      expect(tokenizer.nextToken().value).toBe("hello world");
    });

    it('handles paren comments', function () {
      var tokenizer = new Tokenizer(' 1 ( this is a comment ) 2 ');
      expect(tokenizer.nextToken().value).toBe("1");
      expect(tokenizer.nextToken().value).toBe("2");
      expect(tokenizer.nextToken()).toBe(null);

      tokenizer = new Tokenizer('( this is a comment )');
      expect(tokenizer.nextToken()).toBe(null);
    });

    it('handles slash comments', function () {
      var tokenizer = new Tokenizer(' 1 \\ this is a comment 2 ');
      expect(tokenizer.nextToken().value).toBe("1");
      expect(tokenizer.nextToken()).toBe(null);
    });
  });
});
