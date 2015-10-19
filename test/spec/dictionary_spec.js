describe('Dictionary', function() {
  var dictionary;

  beforeEach(function () {
    dictionary = Dictionary();
  });

  describe('added definitions', function () {
    it('can be looked up', function () {
      dictionary.add("+", function (stack, dictionary) {
        stack.push(stack.pop() + stack.pop());
      });

      expect(typeof dictionary.lookup("+")).toBe("function");
    });
  });

  describe('missing definitions', function () {
    it('returns null', function () {
      expect(dictionary.lookup("missing")).toBe(null);
    });
  });
});
